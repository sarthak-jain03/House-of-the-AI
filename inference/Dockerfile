# inference/Dockerfile
FROM python:3.10-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV DEBIAN_FRONTEND=noninteractive

# system deps needed for some packages (matplotlib, seaborn, fpdf)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# copy app
COPY . .

# expose port used by Railway
ENV PORT=5000
EXPOSE 5000

# start
CMD ["python", "server.py"]
