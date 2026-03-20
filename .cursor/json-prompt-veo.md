# JSON Prompting for Veo 3

## Why it's Different from Image Prompting

Veo 3 doesn't generate video in a single pass. Your input goes through a multi-stage pipeline: Text Encoding, Spatial Attention Networks (frame composition), Temporal Transformers (motion across time), and Audio Expert Networks. When you write an unstructured prompt, the model has to reverse-engineer which parts of your text apply to which network — this causes 15–30% misattribution in complex prompts. JSON eliminates that by speaking directly to each network.

---

## The Full JSON Structure for Veo 3

```json
{
  "version": "1.0",
  "output": {
    "resolution": "4K",
    "aspect_ratio": "16:9",
    "duration": "10 seconds",
    "fps": 24
  },
  "global_style": {
    "aesthetic": "cinematic, hyper-realistic",
    "color_palette": "warm golden tones, deep shadows",
    "film_stock": "35mm"
  },
  "scene": {
    "environment": "dense fog-shrouded redwood forest at dawn",
    "lighting": "rays of light piercing the canopy",
    "time_of_day": "golden hour"
  },
  "subject": {
    "description": "grizzled old fisherman, weathered face, thick wool sweater",
    "action": "limping heavily through knee-deep snowdrift, shielding eyes from wind"
  },
  "camera": {
    "shot_type": "wide shot",
    "lens": "35mm",
    "movement": "slow push-in",
    "framing": "rule of thirds"
  },
  "audio": {
    "dialogue": "none",
    "ambient": "distant wind, soft snow crunch",
    "music": "melancholic strings, low tempo"
  },
  "negative_prompt": "cartoonish, over-saturated, shaky camera, lens flare"
}
```

---

## The 4 Essential Pillars

Every great Veo 3 prompt is built on four pillars:

| Pillar | Weak ❌ | Strong ✅ |
|--------|---------|----------|
| **Subject** | "a person" | "a grizzled old fisherman with a weathered face" |
| **Action** | "walking" | "limping heavily through knee-deep snowdrift, shielding eyes from wind" |
| **Environment** | "a forest" | "fog-shrouded redwood forest at dawn, golden hour" |
| **Style** | "cinematic" | "35mm film, warm golden tones, deep shadows, melancholic mood" |

---

## The Biggest Win: Audio Control

This is where Veo 3 JSON truly shines over image prompting. Veo 3 generates native audio alongside video — dialogue, sound effects, and ambient noise. JSON lets you structure audio into separate layers: primary dialogue, ambient sounds, and technical specs. This gives you a level of audio-visual control no other tool offers.

```json
"audio": {
  "dialogue": "What do you want from me?",
  "ambient": ["rain on glass", "distant thunder"],
  "music": "slow jazz piano, fading in after 3 seconds",
  "sfx": "door creaking at 0:04"
}
```

---

## Real-World Impact

Agencies using structured JSON prompts for Veo 3 ad production have reported up to **70% reduction in revision cycles**. Every prompt becomes a reusable asset — almost like writing code. When something works, it's easy to replicate and scale.

---

## JSON Prompting: Image vs. Video

| | Image (Nano Banana) | Video (Veo 3) |
|---|---|---|
| Main concern | Color/style bleeding | Cross-contamination across time |
| Unique sections | Aperture, ISO, film stock | `audio`, `scenes[]`, `fps`, `duration` |
| Biggest win | Character consistency | Synchronized audio + motion |
| Reusability | High | Very high — scene libraries |

---

## The Mental Model

> JSON prompts for Veo 3 are like giving the AI a **mini production brief**. Once you nail a style for your brand, you can modify individual elements without starting from scratch — swap the subject, keep everything else identical, and get consistent results at scale.
