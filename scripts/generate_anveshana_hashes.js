/**
 * generate_anveshana_hashes.js — Injects canonical SHA-256 hashes into raw Anveshana JSON pools.
 * 
 * Usage:
 *   node generate_anveshana_hashes.js <input_curriculum.json> [output_curriculum.json]
 */
const crypto = require('crypto');
const fs = require('fs');

const SALT = "amritam_anveshana_salt";

function computeHash(optText, questionEn) {
    const raw = `${optText}|${questionEn}|${SALT}`;
    return crypto.createHash('sha256').update(raw, 'utf8').digest('hex');
}

function processStep(step) {
    if (step.type === 'anveshana' && Array.isArray(step.pool)) {
        step.pool.forEach(q => {
            const correctIndex = q.correctOptionIndex !== undefined ? q.correctOptionIndex : 0;
            const correctText = (q.options && q.options[correctIndex]) || "";
            if (correctText && q.questionEn) {
                q.correctOptionHash = computeHash(correctText, q.questionEn);
            }
        });
    }
    return step;
}

function processModule(mod) {
    if (Array.isArray(mod.learningSteps)) {
        mod.learningSteps = mod.learningSteps.map(processStep);
    }
    if (Array.isArray(mod.steps)) {
        mod.steps = mod.steps.map(processStep);
    }
    return mod;
}

function processChapter(ch) {
    if (Array.isArray(ch.modules)) {
        ch.modules = ch.modules.map(processModule);
    }
    return ch;
}

const inputFile = process.argv[2];
const outputFile = process.argv[3] || inputFile;

if (!inputFile) {
    console.error("Usage: node generate_anveshana_hashes.js <input.json> [output.json]");
    process.exit(1);
}

try {
    const raw = fs.readFileSync(inputFile, 'utf8');
    const data = JSON.parse(raw);
    let count = 0;

    let processed;
    if (Array.isArray(data)) {
        processed = data.map(processChapter);
    } else if (data.modules) {
        processed = processChapter(data);
    } else {
        processed = processModule(data);
    }

    fs.writeFileSync(outputFile, JSON.stringify(processed, null, 2), 'utf8');
    console.log(`✅ Successfully processed and injected Anveshana SHA-256 hashes into: ${outputFile}`);
} catch (err) {
    console.error("❌ Error processing curriculum JSON:", err.message);
    process.exit(1);
}
