# Open Culture Analysis

A free, open source tool that walks a team through a structured culture analysis: a documented, shared picture of how the team actually works, and a way to compare one person's working preferences with it.

It runs entirely in your web browser. There is nothing to install, no account, and no server. Your data stays on your computer.

It is a companion to [Open Job Analysis](https://github.com/jfeg1/work-analyzer.app).

## Why culture analysis

Most teams say they hire for "fit" without being able to say what a person is supposed to fit. A culture analysis writes it down. It covers three things:

- **What You Make** – the product or service, and who it is for.
- **What You Do** – habits, communication and customs.
- **What You Think** – norms, values, mission and vision.

The aim is a description of the team as it is today, agreed by the people in it, with the disagreements recorded too.

## How to use it

**Online:** open the hosted page (see "Publishing" below for how the maintainer sets this up).

**Offline:** click **Code → Download ZIP** on GitHub, unzip, and double-click `index.html`.

Then follow the nine steps along the top:

1. **Team** – record the team and, if you wish, adjust the working rules.
2. **Respondents** – add everyone on the team, not only the founders.
3. **Free lists** – each person lists the words and phrases they associate with each part of the culture. The app tallies how many people listed each phrase.
4. **Items** – build the questionnaire from 26 starter statements plus the team's own phrases.
5. **Ratings** – each person rates how true each statement is of the team today, on a five-point scale.
6. **Agreement** – the app sorts each item into Agreed, Split or Scattered.
7. **Workshop** – the team debates the differences and records a decision, evidence and a keep-or-change mark for each item.
8. **Consonance** – a candidate, new hire or team member rates the same statements about themselves, and the app shows how close their preferences sit to the team's answers.
9. **Report** – a printable record of the agreed model.

Click **Load example** to see a completed analysis.

### Collecting answers from several people

People should answer alone and without conferring. Two options:

- **Send files.** At the Respondents step, save a file for each person and send it to them. They open it in the app with **Open file**, answer, and send back the file they save. Open that file in your project and their answers are added. A file never contains anyone else's answers. Send the free-list file first, and the ratings file once the items are final.
- **Enter them yourself.** Collect answers on paper or in an interview and type them in.

The Consonance step works the same way. The file sent to a candidate contains only the personal statements. It never contains the team's answers or the team's wording.

### Saving your work

The app autosaves in your browser, but browser storage can be cleared. Use **Save file** to keep a `.json` project file, and **Open file** to pick it up again on any computer.

## The method

The approach is adapted from two ideas in cognitive anthropology:

- **Cultural consensus analysis** tests whether a group shares one model of a domain by measuring agreement among its members, and derives the group's "answer key" from that agreement (Romney, Weller & Batchelder, 1986; Henderson et al., 2022).
- **Cultural consonance** measures how closely one individual's own beliefs and behaviour match that shared model (Dressler et al., 2015).

Following that tradition, questionnaire items come partly from the team's own words (free-listing), consensus questions ask how things are *here* and not what the respondent prefers, and the personal form is a separate, reworded set of the same items.

The app uses simplified rules suited to small teams. **These are working values that have not been validated**; all are adjustable at step 1.

| Step | Rule (defaults) |
|---|---|
| Team answer | The median rating, unless the workshop sets a different figure |
| Split | Checked first. Ratings form two clusters: a gap of two or more points between neighbouring ratings, with at least 25% of ratings on each side |
| Agreed | At least 80% of ratings fall within one point of the median |
| Scattered | Neither of the above |
| Form 4 | An item is included when it is accepted in the workshop, ticked for Form 4, and has a personal version |
| Closeness | Per item, gap = the distance between the person's rating and the team's answer (0 to 4); closeness = 4 − gap. Score = total closeness ÷ (4 × items answered) × 100 |
| Bands | Low: below 50%. Mid: 40% to 75%. High: above 65%. The bands overlap on purpose; a score in an overlap can be read as either |

Split is checked before Agreed because ratings of 2, 2, 4, 4 have a median of 3, which would otherwise count everyone as "within one point".

The app does not run the formal consensus statistics (the eigenvalue ratio and competence scores). Those need roughly 30 or more respondents to be reliable, and most founding teams are far smaller. For a larger group, export the project file and analyse the ratings with a statistics package.

## Limits of use

- **Not a selection test.** Nothing here has been shown to predict performance or retention. Use it beside job-related criteria, never in place of them.
- **Sameness is not the goal.** A team that hires only for closeness loses the range that helps it adapt. Decide in advance which items need closeness and which benefit from difference.
- **Check items for unfair proxies.** Statements about availability outside working hours or socialising outside work can disadvantage people with caring duties, health conditions or religious commitments. Remove or reword them before using the personal form with candidates.
- **Small teams.** With fewer than ten people, one person moves the median. Treat the results as a structured conversation, not a measurement.
- **Repeat it.** A culture analysis describes one moment. Run it again when the team doubles in size.

## Privacy

Everything happens in your browser. The app makes no network requests and has no analytics. Project files and answer files are plain JSON that you choose where to save and whom to send to. The Agreement step shows how many people chose each rating, not who chose it; the project file itself does hold each person's answers, so store it with care.

## Development

The whole app is one file, `index.html`, with no dependencies and no build step. The calculation logic sits between the `CORE-START` and `CORE-END` markers. Run the tests with:

```
node tests/test.js
```

Issues and pull requests are welcome.

## Publishing (for maintainers)

1. In the repository, open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`, and save.
2. After a minute the app is live at `https://<your-username>.github.io/<repository-name>/`.

## References

- Dressler, W. W., Balieiro, M. C., Ribeiro, R. P., & dos Santos, J. E. (2015). Culture as a mediator of health disparities: Cultural consonance, social class, and health. *Annals of Anthropological Practice, 38*(2), 214–231. https://doi.org/10.1111/napa.12053
- Henderson, N. L., Monocello, L. T., Else, R. J., & Dressler, W. W. (2022). Modeling culture: A framework. *Ethos, 50*(2), 111–130. https://doi.org/10.1111/etho.12348
- Romney, A. K., Weller, S. C., & Batchelder, W. H. (1986). Culture as consensus: A theory of culture and informant accuracy. *American Anthropologist, 88*(2), 313–338.

## Disclaimer

This tool supports good practice; it is not legal advice. Employment law differs by country, including what may be asked of job candidates. If you use a culture analysis in hiring, check the requirements that apply to you.

## License

MIT. See [LICENSE](LICENSE).
