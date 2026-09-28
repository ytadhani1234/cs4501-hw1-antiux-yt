# Hotel Antiusabilius

A static, intentionally frustrating hotel-booking simulation for CS4501 Usability Engineering. The booking can be completed. The table below explains all 16 deliberate usability violations; [the instructor documentation](./documentation.html) includes the lecture references, interaction costs, room calculations, and a grading cheatsheet.

The site uses only HTML, CSS, and vanilla JavaScript. It has no build step, backend, database, external API, real reservations, or payment form. Guest information is explicitly fake and remains in the current browser tab's `sessionStorage`.

## Public URL For the Website
`https://ytadhani1234.github.io/cs4501-hw1-antiux-yt/`

## 16 intentionally broken usability rules

| # | Rule broken | Where and how | Why it makes the task harder |
| --- | --- | --- | --- |
| 1 | Distinguish colors clearly | Results: room status swatches use nearly identical pale colors. | Users must work harder to perceive the differences. |
| 2 | Pair color with another cue | Results: the status swatches have no text or icon. | Color alone carries the status information. |
| 3 | Avoid ambiguous language | Search, Results, Configuration, Review: labels include “Apply” and “Accept Resolution.” | Users must infer what each action does. |
| 4 | Be consistent | The forward button changes wording, color, and position between pages. | A pattern learned on one page does not transfer to the next. |
| 5 | Respect familiar conventions | Green means cancel/back; red usually means continue/confirm. | Familiar color associations point users the wrong way. |
| 6 | Keep time choices chronological | Search: months, weeks, and days appear out of order. | Users cannot scan the choices in their expected sequence. |
| 7 | Keep important information out of ad-like areas | Results: the tax rule appears in a promotional banner. | Banner blindness can hide a rule needed to compare prices. |
| 8 | Limit competing actions | Results: every room has eight buttons, with “Apply” visually weak. | Users must inspect several plausible actions to find selection. |
| 9 | Keep instructions available during a task | Results: the room code and its instruction vanish after acknowledgment. | Users cannot refer to them later in the normal flow. |
| 10 | Favor recognition over recall | Review: users must type the earlier room code without a hint or list. | Recalling the code requires more memory effort. |
| 11 | Use broad, shallow navigation | Search: one date requires five dependent choices. | Users make several unnecessary navigation decisions. |
| 12 | Establish clear visual hierarchy | Results: promotions dominate room names, prices, and selection controls. | Users must search for task-relevant information. |
| 13 | Use readable typography and familiar words | Guest: jargon, small mixed fonts, uppercase text, centered text, and a patterned background surround instructions. | Reading requires extra attention. |
| 14 | Minimize required reading | Guest: a long repetitive policy surrounds one useful email instruction. | Users must scan excessive text for a relevant detail. |
| 15 | Show system status and progress | Booking pages omit a progress indicator; Review hides the summary in collapsed details. | Users must remember what they have completed. |
| 16 | Calculate for users when possible | Results: base rate, fee, and tax are shown separately without totals. | Users must calculate and compare the final prices themselves. |

## Test run: reach the final page

1. Open `index.html` and click the smaller **Proceed** button.
2. On Search choose **Charlottesville, VA** for Geographic Accommodation Zone.
3. Choose **2026 → Q4 → November → Week 2 → 14** in that order. Checkout becomes November 15 automatically.
4. Choose **2** for Human Occupancy Quantity and click **Continue**. This button saves the search choices.
5. On Results, click **Apply** on **Room B — Questionable Deluxe**. Its total is $100.88, lower than Room A ($108.60) and Room C ($107.50).
6. Remember **B-417-K**, click **I Have Perceived This**, then click the red **Proceed** button.
7. On Preference Resolution, leave all four checkboxes **OFF** and click the red **Accept Resolution** button.
8. On the guest page, enter fake details such as `Taylor`, `Sample`, `taylor@example.test`, and `555-0142`. Click **Transmit Declaration Locally**.
9. On Resolution Terminal, type **B-417-K** with no extra spaces and click the red **Finalize Reservation** button.
10. The final page says **Reservation Complete** and shows fake confirmation number **ANTI-2026-417**.

If Review says to change the accommodation parameters, the saved location, date, or guest count differs from the task. This check happens **before** the code check, so retyping the code will not resolve that message. The updated error now names each incorrect value. Follow **Return to Accommodation Parameters**, correct it, and click **Continue** again to save it before moving forward. Changing a dropdown and using browser Forward skips that save. For a completely fresh run, use **Reset / Cancel** on Search or **Cancel Search** on Results.

## View locally

Open `index.html` in a browser. For a local HTTP preview, run a static file server from this repository's root, such as `python3 -m http.server 8000`, and open `http://localhost:8000/`.
