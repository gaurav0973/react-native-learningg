# Feedback Patterns (Toast vs Inline vs Bottom Sheet vs Alert)
- Question: Toast vs inline vs bottom sheet vs alert; never a tap with no response
- This chapter is about one rule that every production mobile app follows: A user should never tap something and wonder whether it worked.



First principle 
- Every interaction must produce immediate feedback
- Feedback dosnt always means success , it means => I heard your tap 


# Desicsion tree

                 USER PERFORMS ACTION
                         │
                         ▼
             What does the user need?
                         │
 ┌──────────────┬───────────────┬──────────────┬──────────────┐
 │              │               │              │
 ▼              ▼               ▼              ▼
Did it work?  What's wrong?  Choose action?  Confirm action?
 │              │               │              │
 ▼              ▼               ▼              ▼
Toast /      Inline         Bottom Sheet     Alert/Dialog
Snackbar     Message


# Universal Tap Feedback Lifecycle

User Tap

    │
    ▼
Immediate Visual Feedback

(Button Pressed / Ripple / Scale)

    │
    ▼
Action Starts

(API / Navigation / Local State)

    │
    ▼
Loading Feedback

(Button Disabled / Spinner)

    │
    ▼
Operation Finished

    │
 ┌──┴───────────────┐
 │                  │
 ▼                  ▼
Success           Failure
 │                  │
 ▼                  ▼
Toast          Inline / Alert / Toast


Tap

↓

Visual Feedback

Must happen FIRST.

Network comes SECOND.



# Snackbar Lifecycle (Undo Pattern)
- Snackbar extends a toast
- Snackbar - temporary exrenda a toast  => erfect for undo actions.

User Deletes Lesson

       │
       ▼
Lesson Removed Immediately

       │
       ▼
Snackbar Appears

"Lesson deleted"

[ Undo ]

       │
 ┌─────┴──────────────┐
 │                    │
 ▼                    ▼
Undo Pressed      Timeout Ends

 ▼                    ▼
Restore Lesson     Permanently Delete


# Bottom Sheet Interaction Flow
- Bottom Sheet provides options
- The original screen never disappears.

User Presses Filter

        │
        ▼
Bottom Sheet Slides Up

──────────────────────

Sort by Price

Sort by Rating

Delivery Time

Offers

──────────────────────

        │
        ▼
User Selects Option

        │
        ▼
Sheet Dismisses

        │
        ▼
Content Updates



rule 
Confirmation

↓

Alert

────────────────

Selection

↓

Bottom Sheet

