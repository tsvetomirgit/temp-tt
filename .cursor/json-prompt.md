# JSON Prompting for Image Generation

## What is JSON Prompting?

Instead of writing a sentence like *"a woman in a dark room with dramatic lighting"*, you structure your prompt as JSON — the same format used in programming:

```json
{
  "subject": "young woman, early 20s",
  "lighting": {
    "type": "dramatic",
    "direction": "top-down",
    "intensity": 0.85
  },
  "camera": {
    "lens": "35mm",
    "aperture": "f/2.0"
  },
  "background": "dimly lit retro room",
  "mood": "intimate, nostalgic"
}
```

The idea is simple: instead of hoping the AI interprets your words correctly, you give it precise structured instructions — like a **blueprint** instead of a description.

---

## Why is it Good?

### ✅ Consistency
Structured prompts improve task accuracy by 60–80% for complex tasks like mixing styles or detailed edits, and make results much easier to repeat.

### ✅ No "Concept Bleeding"
Clear separate categories mean fewer weird AI artifacts. When you define subject, background, and lighting independently, colors and styles don't bleed between them unexpectedly.

### ✅ Precision
Instead of vague words like "bright lighting", JSON lets you set exact numbers, names, and settings. The model skips the natural language interpretation step and directly matches each value to its internal settings — faster, less error, more consistency.

### ✅ Native Understanding (Nano Banana)
Nano Banana's model was trained on extensive amounts of JSON (used for structured output, function calling, and MCP routing), which means it natively understands JSON structure far better than most image models.

### ✅ Batch Generation & Automation
JSON is best when accuracy and repetition are critical — product photography, character design, or research experiments that need the same look every time. It also suits batch generation where many variations are needed.

---

## When to Use It

| Situation | Recommended approach |
|-----------|---------------------|
| Creative exploration / brainstorming | Natural language |
| Consistent character across images | JSON |
| Product photography at scale | JSON |
| Quick one-off generation | Natural language |
| Automated pipelines / batch generation | JSON |

---

## The Honest Caveat

Some real-world tests show that JSON prompting doesn't always produce dramatically different results compared to well-written natural language. The images often look essentially the same, with the expected random variation from LLMs.

> **The community consensus:** use natural language for brainstorming and creative exploration, switch to JSON when you need precision, consistency, and scale — especially for production workflows, product catalogs, or character-consistent storytelling.
