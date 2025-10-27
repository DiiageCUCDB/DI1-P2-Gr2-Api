#!/usr/bin/env node

const fs = require('fs');
const { Octokit } = require('@octokit/rest');

const token = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: token });

const [owner, repo] = process.env.GITHUB_REPOSITORY.split(':')[0].split('/'); 
const prNumber = process.env.PR_NUMBER; // pass via env

// Coverage
const coverageFile = 'coverage/coverage-summary.json';
let coverageTable = 'No coverage data found.';
let coveragePercentage = 0;
if (fs.existsSync(coverageFile)) {
  const coverage = JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
  coveragePercentage = coverage.total.lines.pct;
  coverageTable = `| Metric | Percentage |
| ------ | ---------- |
| Lines | ${coverage.total.lines.pct}% |
| Statements | ${coverage.total.statements.pct}% |
| Functions | ${coverage.total.functions.pct}% |
| Branches | ${coverage.total.branches.pct}% |`;
}

// ESLint
const eslintFile = 'eslint-report.json';
let eslintTable = 'No lint issues 🎉';
if (fs.existsSync(eslintFile)) {
  const eslint = JSON.parse(fs.readFileSync(eslintFile, 'utf8'));
  if (eslint.length > 0) {
    eslintTable = '| File | Line | Message | Rule |\n| ---- | ---- | ------- | ---- |\n';
    eslint.forEach(file => {
      file.messages.forEach(msg => {
        eslintTable += `| ${file.filePath} | ${msg.line} | ${msg.message} | ${msg.ruleId} |\n`;
      });
    });
  }
}

// Generate coverage badge color based on percentage
function getBadgeColor(percentage) {
  if (percentage >= 80) return 'brightgreen';
  if (percentage >= 60) return 'yellow';
  if (percentage >= 40) return 'orange';
  return 'red';
}

const badgeColor = getBadgeColor(coveragePercentage);
const badgeUrl = `https://img.shields.io/badge/coverage-${coveragePercentage}%25-${badgeColor}`;

const body = `## 📊 Test Coverage

![Coverage Badge](${badgeUrl})

${coverageTable}

## ❌ ESLint Issues
${eslintTable}

---
### 📝 Coverage Badge for README
You can add this badge to your README.md:
\`\`\`markdown
![Coverage](${badgeUrl})
\`\`\``;

(async () => {
  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });
})();
