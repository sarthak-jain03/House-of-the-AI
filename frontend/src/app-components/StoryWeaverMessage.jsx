import React from 'react';
import { motion } from 'framer-motion';
import { User, Feather, BookOpen, Sparkles, Film, MapPin, Clock, Clapperboard } from 'lucide-react';

// Parse and format screenplay/story content with professional styling
const formatStoryContent = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  // Helper to process inline formatting
  const processInlineFormatting = (text) => {
    if (!text) return text;
    const parts = [];
    let remaining = text;
    let partIndex = 0;

    //bold text
    while (remaining.includes('**')) {
      const startIdx = remaining.indexOf('**');
      const endIdx = remaining.indexOf('**', startIdx + 2);
      if (endIdx === -1) break;

      if (startIdx > 0) {
        parts.push(<span key={`text-${partIndex++}`}>{remaining.slice(0, startIdx)}</span>);
      }
      parts.push(
        <strong key={`bold-${partIndex++}`} className="text-amber-200 font-semibold">
          {remaining.slice(startIdx + 2, endIdx)}
        </strong>
      );
      remaining = remaining.slice(endIdx + 2);
    }

    //italic text
    if (remaining.includes('*')) {
      const italicParts = remaining.split(/\*([^*]+)\*/);
      italicParts.forEach((part, idx) => {
        if (idx % 2 === 1) {
          parts.push(<em key={`italic-${partIndex++}`} className="text-purple-200">{part}</em>);
        } else if (part) {
          parts.push(<span key={`text-${partIndex++}`}>{part}</span>);
        }
      });
    } else if (remaining) {
      parts.push(<span key={`text-${partIndex++}`}>{remaining}</span>);
    }

    return parts.length > 0 ? parts : text;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Skip empty lines
    if (trimmedLine === '') {
      i++;
      continue;
    }

    if (/^#{1,6}\s+/.test(trimmedLine)) {
      const level = trimmedLine.match(/^#+/)[0].length;
      const text = trimmedLine.replace(/^#{1,6}\s+/, "");

      const Tag = `h${Math.min(level, 6)}`;

      elements.push(
        <Tag
          key={`md-heading-${i}`}
          className={`font-serif mb-4 ${level === 1
              ? "text-3xl text-amber-200 font-bold"
              : level === 2
                ? "text-2xl text-amber-300 font-semibold"
                : "text-xl text-amber-400"
            }`}
        >
          {text}
        </Tag>
      );

      i++;
      continue;
    }

    //SCREENPLAY TITLE
    if (i < 5 && trimmedLine.length > 0 && trimmedLine.length < 80) {
      // Series/Show title or Episode title
      if (/^["'"].*["'"]$/.test(trimmedLine) || trimmedLine === trimmedLine.toUpperCase()) {
        elements.push(
          <motion.div
            key={`title-${i}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-2"
          >
            <h2 className="text-2xl md:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 tracking-wider">
              {trimmedLine}
            </h2>
          </motion.div>
        );
        i++;
        continue;
      }

      if (/^written by/i.test(trimmedLine)) {
        elements.push(
          <p key={`written-${i}`} className="text-center text-gray-400 text-sm tracking-widest uppercase mb-1">
            {trimmedLine}
          </p>
        );
        i++;
        continue;
      }

      if (i > 0 && /^written by/i.test(lines[i - 1]?.trim())) {
        elements.push(
          <p key={`author-${i}`} className="text-center text-purple-300 font-medium mb-6">
            {trimmedLine}
          </p>
        );
        i++;
        continue;
      }
    }

    //ACT/TEASER HEADERS 
    if (/^(TEASER|ACT\s+(ONE|TWO|THREE|FOUR|FIVE|SIX|\d+)|END OF (TEASER|ACT|SHOW)|COLD OPEN)$/i.test(trimmedLine)) {
      elements.push(
        <motion.div
          key={`act-${i}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center my-8"
        >
          <div className="inline-block">
            <h3 className="text-xl font-mono font-bold text-amber-300 tracking-[0.3em] uppercase border-b-2 border-amber-500/50 pb-2">
              {trimmedLine}
            </h3>
          </div>
        </motion.div>
      );
      i++;
      continue;
    }

    //FADE IN/OUT, TRANSITIONS
    if (/^(FADE IN:|FADE OUT\.|FADE TO:|CUT TO:|DISSOLVE TO:|SMASH CUT:|TIME CUT:|MATCH CUT:)$/i.test(trimmedLine)) {
      elements.push(
        <p key={`transition-${i}`} className={`font-mono text-sm text-gray-500 tracking-wider my-4 ${trimmedLine.includes('OUT') || trimmedLine.includes('TO:') ? 'text-right' : 'text-left'
          }`}>
          {trimmedLine}
        </p>
      );
      i++;
      continue;
    }

    //SCENE HEADINGS (INT./EXT.)
    if (/^(INT\.|EXT\.|INT\.\/EXT\.|EXT\.\/INT\.|INTERCUT)/.test(trimmedLine)) {
      // Parse scene heading components
      const isIntercut = /^INTERCUT/.test(trimmedLine);
      const timeMatch = trimmedLine.match(/\s*-\s*(DAY|NIGHT|MORNING|EVENING|LATER|CONTINUOUS|DAWN|DUSK|SAME)(\s*[-,]\s*\d+.*)?(\s*[-,]\s*FLASHBACK)?/i);

      elements.push(
        <motion.div
          key={`scene-${i}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mt-8 mb-4"
        >
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-indigo-900/40 to-purple-900/20 border-l-4 border-amber-500">
            {isIntercut ? (
              <Film className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <MapPin className="w-5 h-5 text-amber-400 flex-shrink-0" />
            )}
            <span className="font-mono text-[15px] font-bold text-amber-100 tracking-wide uppercase">
              {trimmedLine}
            </span>
            {timeMatch && (
              <span className="ml-auto flex items-center gap-1 text-xs text-purple-300 bg-purple-900/30 px-2 py-1 rounded">
                <Clock className="w-3 h-3" />
                {timeMatch[1]}
              </span>
            )}
          </div>
        </motion.div>
      );
      i++;
      continue;
    }

    //SUB-HEADINGS
    if (/^(LATER|CONTINUOUS|MOMENTS LATER|THE CORNER OF|SERIES OF SHOTS|MONTAGE|END FLASHBACK|END OF SUBTITLES)/.test(trimmedLine) ||
      (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 40 && !trimmedLine.includes(':') && !/^[A-Z\s]+\s*\(/.test(trimmedLine))) {
      // Check if it's not a character name (character names are followed by dialogue)
      const nextLine = lines[i + 1]?.trim();
      const isSubHeading = !nextLine || nextLine === '' || /^[\(\[]/.test(nextLine) || !/^[a-z]/.test(nextLine?.charAt(0) || '');

      if (isSubHeading && !(/^[A-Z][A-Z\s]*$/.test(trimmedLine) && nextLine && nextLine.length > 0 && !/^[\(\[]/.test(nextLine))) {
        elements.push(
          <p key={`subheading-${i}`} className="font-mono text-sm text-purple-300 uppercase tracking-wider my-4 pl-4 border-l-2 border-purple-500/30">
            {trimmedLine}
          </p>
        );
        i++;
        continue;
      }
    }

    //CHARACTER NAME + DIALOGUE BLOCK
    const characterMatch = trimmedLine.match(/^([A-Z][A-Z\s']+)(\s*\((V\.O\.|O\.S\.|CONT'D|CONT'D, V\.O\.|CONT'D, O\.S\.|[^)]+)\))?$/);
    if (characterMatch) {
      const characterName = characterMatch[1].trim();
      const extension = characterMatch[2] || '';

      // Look ahead for parentheticals and dialogue
      let dialogueLines = [];
      let parentheticals = [];
      let j = i + 1;

      while (j < lines.length) {
        const nextLine = lines[j]?.trim();
        if (!nextLine) break;

        // Parenthetical (stage direction within dialogue)
        if (/^\([^)]+\)$/.test(nextLine)) {
          parentheticals.push({ index: dialogueLines.length, text: nextLine });
          j++;
          continue;
        }

        // Scene action or new scene heading - stop
        if (/^(INT\.|EXT\.|FADE|CUT TO:|[A-Z][A-Z\s]+$)/.test(nextLine) &&
          !nextLine.match(/^[A-Z][A-Z\s]+:/) &&
          lines[j + 1]?.trim() !== '') {
          break;
        }

        // Another character name - stop
        if (/^[A-Z][A-Z\s']+(\s*\((V\.O\.|O\.S\.|CONT'D|[^)]+)\))?$/.test(nextLine) &&
          j > i + 1) {
          break;
        }

        // Regular dialogue line
        if (nextLine.length > 0 && !/^[A-Z][A-Z\s]+$/.test(nextLine)) {
          dialogueLines.push(nextLine);
          j++;
        } else {
          break;
        }
      }

      if (dialogueLines.length > 0) {
        elements.push(
          <motion.div
            key={`char-block-${i}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-6"
          >
            {/* Character Name*/}
            <div className="text-center mb-2">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/40 to-indigo-600/40 border border-purple-400/30 shadow-lg shadow-purple-900/20">
                <Clapperboard className="w-4 h-4 text-purple-300" />
                <span className="font-mono font-bold text-purple-100 tracking-widest text-sm">
                  {characterName}
                </span>
                {extension && (
                  <span className="text-purple-400 text-xs font-normal">
                    {extension}
                  </span>
                )}
              </span>
            </div>

            {/* Dialogue */}
            <div className="max-w-lg mx-auto">
              {dialogueLines.map((dLine, dIdx) => {
                // Check if there's a parenthetical before this line
                const parenthetical = parentheticals.find(p => p.index === dIdx);

                return (
                  <React.Fragment key={dIdx}>
                    {parenthetical && (
                      <p className="text-center text-purple-400/80 text-sm italic my-2">
                        {parenthetical.text}
                      </p>
                    )}
                    <p className="text-center text-gray-100 leading-relaxed text-[15px] font-serif">
                      {processInlineFormatting(dLine)}
                    </p>
                  </React.Fragment>
                );
              })}
            </div>
          </motion.div>
        );

        i = j;
        continue;
      }
    }

    //INLINE DIALOGUE (Character: dialogue format) 
    const inlineDialogueMatch = trimmedLine.match(/^([A-Z][A-Za-z\s']+):\s*(.+)/);
    if (inlineDialogueMatch) {
      const [, character, dialogue] = inlineDialogueMatch;

      elements.push(
        <motion.div
          key={`inline-dialogue-${i}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="my-4"
        >
          {/* Character Name*/}
          <div className="text-center mb-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-600/30 border border-purple-400/20">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
              <span className="font-mono font-bold text-purple-200 tracking-wider text-sm uppercase">
                {character.trim()}
              </span>
            </span>
          </div>
          {/* Dialogue */}
          <div className="max-w-lg mx-auto text-center">
            <p className="text-gray-100 leading-relaxed text-[15px] font-serif">
              {processInlineFormatting(dialogue)}
            </p>
          </div>
        </motion.div>
      );
      i++;
      continue;
    }

    //PARENTHETICAL / STAGE DIRECTIONS
    if (/^\([^)]+\)$/.test(trimmedLine) || /^\[[^\]]+\]$/.test(trimmedLine)) {
      elements.push(
        <p key={`parenthetical-${i}`} className="text-center text-purple-400/70 text-sm italic my-2 tracking-wide">
          {trimmedLine}
        </p>
      );
      i++;
      continue;
    }

    //SPECIAL NOTES
    if (/^NOTE:/i.test(trimmedLine)) {
      elements.push(
        <div key={`note-${i}`} className="my-4 p-3 rounded-lg bg-amber-900/20 border border-amber-500/30">
          <p className="text-amber-200 text-sm font-mono uppercase">
            {trimmedLine}
          </p>
        </div>
      );
      i++;
      continue;
    }

    // SCENE ACTION / REGULAR PARAGRAPHS
    let actionLines = [trimmedLine];
    let j = i + 1;

    while (j < lines.length) {
      const nextLine = lines[j]?.trim();

      // Stop on empty line, scene heading, character name, etc.
      if (!nextLine ||
        /^(INT\.|EXT\.|FADE|CUT TO:)/.test(nextLine) ||
        /^[A-Z][A-Z\s']+(\s*\((V\.O\.|O\.S\.|CONT'D)\))?$/.test(nextLine) ||
        /^(TEASER|ACT\s|END OF)/.test(nextLine)) {
        break;
      }

      actionLines.push(nextLine);
      j++;
    }

    elements.push(
      <motion.p
        key={`action-${i}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-300 leading-[1.8] text-[15px] my-4 first-letter:text-xl first-letter:font-serif first-letter:text-amber-300/80"
      >
        {actionLines.map((aLine, aIdx) => (
          <React.Fragment key={aIdx}>
            {aIdx > 0 && ' '}
            {processInlineFormatting(aLine)}
          </React.Fragment>
        ))}
      </motion.p>
    );

    i = j;
  }

  return elements;
};

export default function StoryWeaverMessage({ message, isUser, confidence }) {
  const formattedContent = !isUser ? formatStoryContent(message) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${isUser
            ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/20'
            : 'bg-gradient-to-br from-amber-900/40 to-amber-800/30 border border-amber-500/40 shadow-amber-500/10'
          }`}
      >
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Feather className="w-5 h-5 text-amber-300" />
        )}
      </motion.div>

      {/* Message */}
      <div className={`max-w-[85%] ${isUser ? 'text-left' : ''}`}>
        {isUser ? (
          // User message 
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl px-5 py-3 bg-purple-500/30 border border-purple-500/30 text-white shadow-lg shadow-purple-500/10"
          >
            <p className="text-[15px] font-medium leading-relaxed">{message}</p>
          </motion.div>
        ) : (
          // AI Story output
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >

            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-2 border-l-2 border-amber-500/30 rounded-tl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-2 border-r-2 border-amber-500/30 rounded-br-lg" />

            <div className="rounded-2xl px-6 py-5 bg-gradient-to-br from-[#1a1a2e] via-[#1e1e32] to-[#16162a] border border-white/10 shadow-xl">

              <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-amber-400/70 uppercase tracking-widest">Story Weaver</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                  <Film className="w-3 h-3" />
                  <span>Screenplay Format</span>
                </div>
              </div>

              {/* Story content */}
              <div className="story-content font-serif">
                {formattedContent}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-center gap-3 mt-6 pt-4 border-t border-white/5">
                <span className="text-amber-500/40">✦</span>
                <span className="text-amber-500/30">✦</span>
                <span className="text-amber-500/40">✦</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}