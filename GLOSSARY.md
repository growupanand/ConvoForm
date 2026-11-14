# ConvoForm

ConvoForm turns static forms into conversational experiences: creators build forms, share links, and collect completed conversations from respondents.

## Language

**Owner preview**:
A conversation the form’s creator runs from the form editor preview. It is stored and processed like any other submission (email, insights, analytics), but is tagged so activation funnels can exclude or segment it from real respondent traffic.
_Avoid_: Test conversation, draft submission

**Response label**:
A scored classification attached to a completed conversation. Tone and sentiment use the same values as the old LLM insights; lead temperature is new. Labels below a confidence threshold are hidden rather than shown.
_Avoid_: Tag, score

**Lead temperature**:
How ready a respondent is to talk to a counselor: `Hot` (ready to proceed), `Warm` (exploring) or `Cold` (low intent). It is a response label, not a lead score from the CRM.
_Avoid_: Lead score, priority

**Auto-tag**:
An owner-defined response tag, such as Country or Budget. Each tag has up to six choices and is enabled per form under Settings → General.
_Avoid_: Custom category, custom field, segment
