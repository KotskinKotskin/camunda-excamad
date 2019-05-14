### What is this?

This is admin portal for camunda projects. I name it excamad. You can view and manage business process from _your_ camunda inside this portal.

---

### What is camunda?

Camunda is a open-source Java-based framework for business process applcation. Camunda used BPMN for describe and run process.
[More.](https://docs.camunda.org/manual/7.9/introduction/architecture/)

Check core [camunda concepts](https://docs.camunda.org/manual/7.8/user-guide/process-engine/process-engine-concepts/) to understand big picture.

---

### What is BPMN?

Business Process Model and Notation (BPMN) is a graphical representation for specifying business processes in a business process model.
[More.](https://en.wikipedia.org/wiki/Business_Process_Model_and_Notation).

---

### How excamad work?

Excamad work over standard [camunda rest api](https://docs.camunda.org/manual/7.9/reference/rest/). Excamad is serveless app, there is no backend. That mean all network request, maded from excamad, go directly from your browser to camunda server. Right now excamad cover about 70% of api.

You can think about excamad like it beautiful collection of postman requests.

---

### How to use it?

Take REST URL of project (like this _http://bpm-cloud.tinkoff.ru/sme-rko-origination-service/rest/_) and put in [settings](#/settings).

---

### Why some buttons is disabled?

You must be _expert_ to enable it.

---

### Why i cannot connect to camunda?

- Wrong url.
- No network access.
- Disabled cors.
  Talk to your devops about it.

---
