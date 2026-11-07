# Inkloom AI — Round 2 Working Prototype

A front-end-only prototype built with HTML, CSS and vanilla JavaScript.

## Run in VS Code
1. Extract `Inkloom_AI_Round2_Prototype.zip`.
2. Open the extracted `inkloom_ai_round2` folder in VS Code.
3. Open `index.html` in a browser, or install the VS Code **Live Server** extension.
4. If using Live Server, right-click `index.html` and choose **Open with Live Server**.

No npm install, backend, API key or internet connection is required for the core demo. Google Fonts are optional; the page falls back to system fonts.

## Demo flow for judges
1. Open Content review.
2. Choose a production reference pack.
3. Edit the promotional draft or load the sample.
4. Click **Run governance audit**.
5. Review each finding, its explanation, evidence and suggested correction.
6. Click **Apply suggestion** on an applicable finding, then run the audit again.
7. Record **Approve**, **Request revision**, or **Override with reason**.
8. Open Review history to see the decision record.
9. Open Studio guidelines to inspect the fictional policy packs.

## What is implemented
- Two selectable fictional production reference packs.
- Studio-wide and production-specific context shown together.
- Deterministic JavaScript checks for title, release date, lead character, platform and potentially unverified promotional claims.
- Findings with severity, explanations, evidence and suggested corrections.
- Editable draft and applicable one-click suggestions.
- Human review decisions and local browser history using localStorage.
- Responsive interface.

## Important limitations
- This is a rule-based prototype, not a connected generative AI model.
- It checks only the rules explicitly implemented in `app.js`; it cannot guarantee that all factual or brand issues are detected.
- It does not analyse uploaded images, posters, videos or full scripts.
- Demo studio, campaign and production facts are fictional.
- Review history is stored only in the current browser on the current device.
- No content is uploaded to a server and no real publishing action occurs.

## Files
- `index.html` — page structure
- `styles.css` — visual design and responsive layout
- `app.js` — local audit logic, suggestions, decisions and history
