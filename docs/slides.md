In Claude Code:

/plugin marketplace add anthropics/skills
/plugin install document-skills@anthropic-agent-skills

This installs Anthropic's docx, pdf, pptx, and xlsx skills together as one plugin. Once installed, just ask Claude Code to do something like "use the pptx skill to build a presentation from this content" and it'll pick it up automatically.

A couple of honest caveats before you do this:

Node.js + pptxgenjs need to be available in Claude Code's execution environment, since the skill is instructions for Claude, not the code itself — Claude will run npm install pptxgenjs (or expect it preinstalled) when it actually builds the file.
There are a couple of known bugs in this marketplace right now: some users report it loading all ~17 skills from the repo instead of just the 4 document ones (wastes context but isn't harmful), and a separate report of plugin-installed skills not registering at all due to a missing folder-structure quirk. If /plugin install doesn't seem to work, the workaround people are using is cloning the repo and symlinking the skill folder directly:
  git clone https://github.com/anthropics/skills ~/skills-src
  cp -r ~/skills-src/skills/pptx ~/.claude/skills/pptx

If you want something more actively maintained/polished specifically for HTML→PPTX conversion (closer to what I did with your deck), there's also a community skill called pptx-builder (github.com/Julien339/pptx-builder-skill) built specifically to turn HTML slide designs into pixel-accurate, fully-editable native PowerPoint shapes — worth a look if you're doing this kind of conversion often.