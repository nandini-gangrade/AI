
**Step 2: Set Up a React Project**

Open your terminal (in VS Code or anywhere) and run:

```bash
npm create vite@latest incident-auth -- --template react
cd incident-auth
npm install
```

---

**Step 3: Paste the Code**

Open the project in VS Code:
```bash
code .
```
Then navigate to `src/App.jsx`, **select all** the existing code and **paste** your copied code to replace it.

---

**Step 4: Clean Up Unused Files**

Delete or clear `src/App.css` and `src/index.css` so old styles don't interfere. You can also delete the `src/assets` folder if you like.

---

**Step 5: Run the App**

In the VS Code terminal:
```bash
npm run dev
```
Then open your browser to `http://localhost:5173` and you'll see the app running.

---

**Step 6: Push to GitHub**

First, create a new repository on [github.com](https://github.com) (click **New Repository**, give it a name, don't add a README).

Then in your terminal, run:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```
Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name.
