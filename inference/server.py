import os
import io
import json
import base64
import tempfile
import traceback
from datetime import datetime, timezone

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
plt.switch_backend('Agg')
import seaborn as sns
from fpdf import FPDF

import requests
from dotenv import load_dotenv
load_dotenv()




app = Flask(__name__)
CORS(app, origins=["*"], supports_credentials=True)


FIREWORKS_API_KEY = os.getenv("FIREWORKS_API_KEY")
FIREWORKS_URL = os.getenv("FIREWORKS_URL")

FIREWORKS_MODEL = os.getenv("FIREWORKS_MODEL")


MODELS = {
    "poet": "accounts/fireworks/models/deepseek-v3p2",
    "coder": "accounts/fireworks/models/deepseek-r1-distill-qwen-1.5b",
    "story": "accounts/fireworks/models/deepseek-r1-distill-qwen-1.5b",
    "analyzer": "accounts/fireworks/models/deepseek-v3p2"
}

clients = {name: None for name in MODELS}
print("[OK] Model Routing Initialized.")



POET_PROMPT = """
You are The Poet. Always respond in artistic, emotional poetry...
"""

CODE_PROMPT = """
    "You are **The Code Whisperer**, a master of programming. "
    "You respond with clean, minimal, and highly precise code. "
    "No unnecessary classes, no repeated boilerplate, no fluff. "
    "Give the simplest working code and brief, accurate explanations only when needed. "
    "Never add storytelling or poetic text. Remain purely technical."
"""

STORY_PROMPT = """
You are The Story Weaver. Produce immersive stories, scripts, outlines...
"""

DATASET_PROMPT = """
You are The Dataset Oracle. Provide structured insights: summary, patterns,
correlations, anomalies, recommendations, and forecasts.
"""


chat_history = {
    "poet": [],
    "coder": [],
    "story": []
}

_global_data_store = {
    "name": None,
    "df": None,
    "eda": None,
    "insights": None
}

_chart_store = {}


def hf_chat(client_unused, system_prompt, user_prompt):
    
    if not FIREWORKS_API_KEY:
        return "[ERROR] FIREWORKS_API_KEY missing."

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {FIREWORKS_API_KEY}"
    }

    payload = {
        "model": FIREWORKS_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 500
    }

    try:
        response = requests.post(FIREWORKS_URL, headers=headers, json=payload, timeout=40)
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        print("FIREWORKS ERROR:", e)
        return f"[MODEL ERROR] {str(e)}"



def process_chat(user_prompt, key, model_client, persona):
    history = chat_history[key]
    messages = [{"role": "system", "content": persona}]
    # reconstruct history
    for i in range(0, len(history), 2):
        try:
            messages.append({"role": "user", "content": history[i]})
            messages.append({"role": "assistant", "content": history[i+1]})
        except Exception:
            pass

    # add new prompt
    messages.append({"role": "user", "content": user_prompt})

    try:
        user_concat = "\n".join([m["content"] for m in messages if m["role"] == "user"])
        output = hf_chat(None, persona, user_concat)
    except Exception as e:
        output = "[ERROR] " + str(e)

    # save to history
    history.append(user_prompt)
    history.append(output)
    chat_history[key] = history

    return output



def read_uploaded_file_storage(file_storage):
    content = file_storage.read()
    try:
        return content.decode("utf-8")
    except:
        return content.decode("latin-1", errors="ignore")


def parse_dataset_text(text):
    from io import StringIO
    t = text.strip()

    # try json
    try:
        if t.startswith("{") or t.startswith("["):
            return pd.read_json(StringIO(t))
    except Exception:
        pass

    # try csv
    try:
        return pd.read_csv(StringIO(t))
    except Exception:
        pass

    # try tab separated
    try:
        return pd.read_csv(StringIO(t), sep="\t")
    except Exception:
        pass

    # fallback: each line as a row under 'text'
    return pd.DataFrame({"text": t.splitlines()})


def compute_eda(df):
    eda = {}
    eda["rows"], eda["columns"] = df.shape
    eda["columns_list"] = df.columns.tolist()
    eda["missing_values"] = df.isnull().sum().to_dict()
    eda["types"] = {c: str(df[c].dtype) for c in df.columns}
    

    try:
        eda["summary"] = df.describe(include="all", datetime_is_numeric=True).to_dict()
        
    except Exception:
        eda["summary"] = {}

    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if len(num_cols) >= 2:
        eda["correlation"] = df[num_cols].corr().fillna(0).to_dict()
    else:
        eda["correlation"] = {}

    # outliers
    outliers = {}
    for c in num_cols:
        s = df[c].dropna()
        if len(s) < 4:
            continue
        Q1, Q3 = s.quantile(0.25), s.quantile(0.75)
        IQR = Q3 - Q1
        low, high = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
        outliers[c] = int(((s < low) | (s > high)).sum())

    eda["outliers_count"] = outliers
    _global_data_store["eda"] = eda
    return eda


def compute_advanced_eda(df):
    analysis = {}

    num_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()

    # NUMERICAL DISTRIBUTION ANALYSIS
    distribution = []
    for col in num_cols:
        s = df[col].dropna()
        if len(s) == 0:
            continue
        try:
            skew = float(s.skew())
        except Exception:
            skew = 0.0
        try:
            kurt = float(s.kurt())
        except Exception:
            kurt = 0.0

        if abs(skew) > 1:
            fix = "Apply log/box-cox transform"
        elif abs(skew) > 0.5:
            fix = "Try normalization or robust scaling"
        else:
            fix = "Distribution looks approximately normal"

        distribution.append({
            "column": col,
            "skew": round(skew, 3),
            "kurtosis": round(kurt, 3),
            "fix": fix,
            "count_non_null": int(s.shape[0])
        })

    analysis["distribution_summary"] = distribution
    

    # CATEGORICAL ANALYSIS
    categorical_summary = []
    for col in cat_cols:
        col_series = df[col].astype(object).fillna("")
        vc = col_series.value_counts()
        total = len(df)
        rare = vc[vc < 0.01 * total].index.tolist()
        top_values = vc.head(5).to_dict()
        categorical_summary.append({
            "column": col,
            "unique": int(col_series.nunique()),
            "top_values": top_values,
            "rare_labels": rare,
            "cardinality": int(col_series.nunique())
        })

    analysis["categorical_summary"] = categorical_summary

    # TOP CORRELATIONS
    corrs = []
    if len(num_cols) >= 2:
        corr_matrix = df[num_cols].corr().abs()
        for i, col_i in enumerate(num_cols):
            for j in range(i + 1, len(num_cols)):
                col_j = num_cols[j]
                val = float(corr_matrix.loc[col_i, col_j])
                corrs.append({
                    "pair": f"{col_i} ↔ {col_j}",
                    "value": round(val, 3),
                    "raw_value": float(df[num_cols].corr().loc[col_i, col_j])
                })
        corrs = sorted(corrs, key=lambda x: x["value"], reverse=True)[:15]
    analysis["correlation_top"] = corrs

    # QUALITY FLAGS
    flags = []
    dup = int(df.duplicated().sum())
    if dup > 0:
        flags.append(f"{dup} duplicate rows detected.")

    for col in df.columns:
        if df[col].dtype == object:
            try:
                is_mixed_numeric = df[col].apply(lambda x: str(x).replace('.', '', 1).isdigit()).sum()
                if is_mixed_numeric > len(df) * 0.6:
                    flags.append(f"Column '{col}' contains many numeric-looking strings (mixed types). Consider coercing to numeric.")
            except Exception:
                pass

    for col in df.columns:
        if df[col].nunique(dropna=False) <= 1:
            flags.append(f"Column '{col}' is constant (single unique value). Consider dropping it.")

    analysis["quality_flags"] = flags

    # ML RECOMMENDATIONS
    rec = []
    if len(cat_cols) > 0:
        rec.append("Apply One Hot Encoding or target encoding for categorical variables (watch high-cardinality columns).")
    if len(num_cols) > 0:
        rec.append("Standardize or normalize numerical columns (e.g., StandardScaler or RobustScaler).")
    rec.append("Consider removing or capping extreme outliers, or use robust models (e.g., tree-based or robust regression).")

    high_missing = [c for c, v in df.isnull().mean().to_dict().items() if v > 0.4]
    if high_missing:
        rec.append(f"Drop or impute columns with >40% missing values: {', '.join(high_missing)}")

    if flags:
        rec.append("Resolve data quality flags before model training (duplicates, mixed types, constant cols).")

    analysis["ml_recommendations"] = rec
    _global_data_store["analysis"] = analysis

    return analysis


def auto_clean_dataframe(df):
    df = df.copy()
    for col in df.columns:
        if df[col].dtype == object:
            coerced = pd.to_numeric(df[col], errors="coerce")
            if coerced.notna().sum() > len(df)*0.6:
                df[col] = coerced

        if pd.api.types.is_numeric_dtype(df[col]):
            df[col] = df[col].fillna(df[col].median())
        else:
            try:
                df[col] = df[col].fillna(df[col].mode()[0])
            except:
                df[col] = df[col].fillna("")
    return df


def fig_to_b64(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight")
    buf.seek(0)
    b64 = base64.b64encode(buf.read()).decode()
    plt.close(fig)
    return b64


def save_fig(fig):
    b64 = fig_to_b64(fig)
    cid = f"chart_{len(_chart_store)+1}"
    _chart_store[cid] = base64.b64decode(b64)
    return cid, b64



def generate_charts(df):
    charts = []
    num = df.select_dtypes(include=[np.number]).columns.tolist()
    cat = df.select_dtypes(include=['object', 'category']).columns.tolist()

   
    for c in num[:5]:
        try:
            fig, ax = plt.subplots()
            sns.histplot(df[c].dropna(), kde=True, ax=ax)
            ax.set_title(f"Distribution of {c}")
            cid, b64 = save_fig(fig)
            charts.append({"id": cid, "title": f"Distribution: {c}", "b64": b64})
        except Exception:
            pass

    # correlation heatmap
    if len(num) >= 2:
        try:
            fig, ax = plt.subplots(figsize=(6, 5))
            sns.heatmap(df[num].corr(), annot=False, cmap="coolwarm", ax=ax)
            ax.set_title("Correlation Heatmap")
            cid, b64 = save_fig(fig)
            charts.append({"id": cid, "title": "Correlation Heatmap", "b64": b64})
        except Exception:
            pass

    # top categorical frequency chart
    if len(cat) >= 1:
        try:
            c0 = cat[0]
            fig, ax = plt.subplots(figsize=(6, 4))
            vc = df[c0].value_counts().nlargest(10)
            sns.barplot(x=vc.values, y=vc.index, ax=ax)
            ax.set_title(f"Top categories: {c0}")
            cid, b64 = save_fig(fig)
            charts.append({"id": cid, "title": f"Top categories: {c0}", "b64": b64})
        except Exception:
            pass

    return charts





@app.route("/analyze", methods=["POST"])
def analyze_endpoint():
    try:
        if request.files:
            fs = list(request.files.values())[0]
            txt = read_uploaded_file_storage(fs)
            df = parse_dataset_text(txt)
            name = fs.filename
        else:
            data = request.json
            txt = data.get("dataset", "")
            df = parse_dataset_text(txt)
            name = "dataset"

        
        df_clean = auto_clean_dataframe(df)

        #deterministic EDA
        eda = compute_eda(df_clean)
        advanced = compute_advanced_eda(df_clean)
        eda.update(advanced)

        # Charts
        charts = generate_charts(df_clean)

        _global_data_store["name"] = name
        _global_data_store["df"] = df_clean
        _global_data_store["eda"] = eda
        _global_data_store["insights"] = None 

        return jsonify({
            "success": True,
            "dataset_name": name,
            "eda": eda,
            "charts": charts
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)})




@app.route("/chat-with-data", methods=["POST"])
def chat_with_data():
    """Answers user questions based on the last analyzed dataset's context."""
    try:
        if _global_data_store["df"] is None:
            return jsonify({"success": False, "error": "Analyze a dataset first."}), 400

        q = (request.json or {}).get("message", "")
        if not q:
            return jsonify({"success": False, "error": "No question provided."}), 400

        eda = _global_data_store["eda"]
        minimal_context = {
            "dataset_name": _global_data_store["name"],
            "summary": eda.get("summary", {}),
            "top_correlations": eda.get("correlation_top", []),
            "distribution": eda.get("distribution_summary", [])[:5],
            "quality_flags": eda.get("quality_flags", []),
            "ml_recommendations": eda.get("ml_recommendations", [])
        }

        system_prompt = (
            "You are a concise dataset assistant. "
            "Answer briefly using only the provided context. "
            "Do NOT hallucinate missing info."
        )

        user_prompt = (
            f"Context: {json.dumps(minimal_context)}\n"
            f"User question: {q}\n"
            "Answer concisely and accurately."
        )

        try:
            payload = {
                "model": FIREWORKS_MODEL,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.0,
                "max_tokens": 300,
                "stream": False
            }

            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {FIREWORKS_API_KEY}"
            }

            resp = requests.post(FIREWORKS_URL, headers=headers, json=payload, timeout=30)
            resp.raise_for_status()
            jr = resp.json()
            answer = jr.get("choices", [{}])[0].get("message", {}).get("content", "[ERROR] no content")

        except Exception as e:
            answer = f"[MODEL ERROR] {str(e)}. You can still inspect correlations, summary stats, and distributions in the EDA report."

        return jsonify({"success": True, "response": answer})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500




@app.route("/download-chart/<cid>", methods=["GET"])
def download_chart(cid):
    if cid not in _chart_store:
        return jsonify({"error": "Chart not found"}), 404
    buf = io.BytesIO(_chart_store[cid])
    buf.seek(0)
    return send_file(buf, mimetype="image/png", as_attachment=True, download_name=f"{cid}.png")





@app.route("/export-pdf", methods=["POST"])
def export_pdf():
    try:
        data = request.json
        title = data.get("title", "Dataset Report")
        insights = data.get("insights", "")
        eda = data.get("eda", {})
        chart_ids = data.get("chart_ids", [])

        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", "B", 16)
        pdf.cell(0, 10, title, ln=True)

        pdf.set_font("Arial", "", 11)
        pdf.multi_cell(0, 6, insights)

        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 8, "EDA Summary:", ln=True)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 6, json.dumps(eda, indent=2))

        for cid in chart_ids:
            if cid in _chart_store:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tf:
                    tf.write(_chart_store[cid])
                    fname = tf.name
                pdf.add_page()
                pdf.image(fname, x=10, y=10, w=180)
                os.remove(fname)

        out = io.BytesIO(pdf.output(dest='S').encode('latin-1'))
        out.seek(0)

        return send_file(out, mimetype="application/pdf", as_attachment=True,
                         download_name=f"dataset_report_{int(datetime.now().timestamp())}.pdf")

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)})



@app.route("/poet_chat", methods=["POST"])
def poet_chat():
    text = request.json.get("prompt", "")
    out = process_chat(text, "poet", clients["poet"], POET_PROMPT)
    return jsonify({"response": out, "confidence": "95"})



@app.route('/code_chat', methods=['POST'])
def code_chat():
    """Endpoint for The Code Whisperer persona."""
    data = request.get_json()
    user_prompt = data.get("prompt")

    if not user_prompt:
        return jsonify({"error": "No prompt provided"}), 400

    try:
        response = process_chat(
            user_prompt, "coder", clients["coder"], CODE_PROMPT
        )
        return jsonify({"response": response, "confidence": "98"}) 
    except Exception as e:
        print("Coder error:", e)
        return jsonify({
            "response": "Code structure corrupted. Server error.",
            "confidence": "0"
        }), 500

@app.route("/story_weaver_chat", methods=["POST"])
def story_weaver_chat():
    text = request.json.get("prompt", "")
    out = process_chat(text, "story", clients["story"], STORY_PROMPT)
    return jsonify({"response": out, "confidence": "95"})



@app.route("/story-weaver", methods=["POST"])
def story_weaver():
    data = request.json
    action = data.get("action", "continue_story")
    story = data.get("story", "")
    prompt = data.get("prompt", "")

    if action == "write_script":
        instruction = f"Convert to screenplay:\n{story}\n\n{prompt}"
    elif action == "add_character":
        instruction = f"Add character and rewrite:\n{story}\n\n{prompt}"
    elif action == "plot_outline":
        instruction = f"Create plot outline:\n{story}\n\n{prompt}"
    elif action == "alt_directions":
        instruction = f"Alternative story paths:\n{story}\n\n{prompt}"
    else:
        instruction = f"Continue story:\n{story}\n\n{prompt}"

    out = hf_chat(None, STORY_PROMPT, instruction)
    return jsonify({
        "success": True,
        "response": out,
        "updated_story": out,
        "confidence": 95
    })




# if __name__ == "__main__":
#     print("Server running at http://127.0.0.1:5000")
#     app.run(debug=True)

@app.route("/ping")
def ping():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Running on port {port}")
    app.run(host="0.0.0.0", port=port)

