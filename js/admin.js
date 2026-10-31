(() => {
  const $ = id => document.getElementById(id);
  const form = $("eventForm");
  const list = $("adminEvents");
  let events = [];

  function credentials() {
    let password = sessionStorage.getItem("bcAdminPassword");
    if (!password) {
      password = window.prompt("Enter the BC Vienna Arena admin password:");
      if (password === null) throw new Error("Login cancelled.");
      sessionStorage.setItem("bcAdminPassword", password);
    }
    return "Basic " + btoa(unescape(encodeURIComponent("admin:" + password)));
  }

  async function api(url, options = {}) {
    const headers = { ...(options.headers || {}), Authorization: credentials() };
    if (options.body) headers["Content-Type"] = "application/json";
    let response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      sessionStorage.removeItem("bcAdminPassword");
      throw new Error("Incorrect admin password. Refresh the page and try again.");
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }

  function notify(message, type = "success") {
    const box = $("notice");
    box.textContent = message;
    box.className = `notice show ${type}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function escapeHtml(value = "") {
    return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  function dateLabel(date) {
    return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${date}T12:00:00`));
  }

  function dateRangeLabel(start, end) {
    const first = dateLabel(start);
    if (!end || end === start) return first;
    return `${first} – ${dateLabel(end)}`;
  }

  function render() {
    $("eventCount").textContent = events.length;
    if (!events.length) {
      list.innerHTML = '<div class="empty-state"><span>＋</span><h3>No events yet</h3><p>Add your first event using the form.</p></div>';
      return;
    }
    list.innerHTML = events.map(event => `<article class="admin-event">
      <div class="event-date"><b>${escapeHtml(event.date.slice(8, 10))}</b><span>${escapeHtml(dateRangeLabel(event.date, event.endDate).replace(/^\d+\s*/, ""))}</span></div>
      <div class="admin-event-info"><div class="event-title-line"><h3>${escapeHtml(event.title)}</h3><span class="status ${event.published ? "published" : "draft"}">${event.published ? "PUBLISHED" : "DRAFT"}</span></div>
      <p>${escapeHtml(event.category)} · ${escapeHtml(event.startTime)}–${escapeHtml(event.endTime)}${event.endDate && event.endDate !== event.date ? ` · Ends ${escapeHtml(dateLabel(event.endDate))}` : ""}</p><p class="venue-line">⌖ ${escapeHtml(event.venue)}</p></div>
      <div class="event-actions"><button type="button" data-edit="${escapeHtml(event.id)}">EDIT</button><button type="button" class="delete-button" data-delete="${escapeHtml(event.id)}">DELETE</button></div>
    </article>`).join("");
  }

  async function load() {
    try {
      events = await api("/api/admin/events");
      render();
    } catch (error) {
      list.innerHTML = `<div class="empty-state error">${escapeHtml(error.message)}<p>Check that the server is running and ADMIN_PASSWORD is configured in api/.env.</p></div>`;
    }
  }

  function formData() {
    return {
      title: $("title").value.trim(), date: $("date").value, endDate: $("endDate").value,
      startTime: $("startTime").value, endTime: $("endTime").value,
      venue: $("venue").value.trim(), category: $("category").value,
      artists: $("artists").value.trim(), description: $("description").value.trim(),
      ticketUrl: $("ticketUrl").value.trim(), imageUrl: $("imageUrl").value.trim(),
      published: $("published").checked
    };
  }

  function resetForm() {
    form.reset();
    $("eventId").value = "";
    $("published").checked = true;
    $("formEyebrow").textContent = "NEW EVENT";
    $("formTitle").textContent = "Add an event";
    $("saveButton").textContent = "SAVE EVENT ↗";
    $("cancelEdit").hidden = true;
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    const id = $("eventId").value;
    const button = $("saveButton");
    button.disabled = true;
    button.textContent = "SAVING…";
    try {
      await api(id ? `/api/admin/events/${encodeURIComponent(id)}` : "/api/admin/events", {
        method: id ? "PUT" : "POST", body: JSON.stringify(formData())
      });
      notify(id ? "Event updated successfully." : "Event created successfully.");
      resetForm();
      await load();
    } catch (error) { notify(error.message, "error"); }
    finally { button.disabled = false; button.textContent = id ? "UPDATE EVENT ↗" : "SAVE EVENT ↗"; }
  });

  list.addEventListener("click", async event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");
    if (editButton) {
      const item = events.find(entry => entry.id === editButton.dataset.edit);
      if (!item) return;
      $("eventId").value = item.id;
      ["title", "date", "endDate", "startTime", "endTime", "venue", "category", "artists", "description", "ticketUrl", "imageUrl"].forEach(key => $(key).value = item[key] || "");
      $("published").checked = Boolean(item.published);
      $("endDate").min = item.date;
      $("formEyebrow").textContent = "EDIT EVENT";
      $("formTitle").textContent = "Update event";
      $("saveButton").textContent = "UPDATE EVENT ↗";
      $("cancelEdit").hidden = false;
      $("title").focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    if (deleteButton) {
      const item = events.find(entry => entry.id === deleteButton.dataset.delete);
      if (!item || !window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
      try {
        await api(`/api/admin/events/${encodeURIComponent(item.id)}`, { method: "DELETE" });
        notify("Event deleted.");
        await load();
      } catch (error) { notify(error.message, "error"); }
    }
  });

  $("date").addEventListener("change", () => {
    const endDate = $("endDate");
    if (!endDate.value || endDate.value < $("date").value) endDate.value = $("date").value;
    endDate.min = $("date").value;
  });
  $("endDate").addEventListener("change", () => {
    if ($("date").value) $("endDate").min = $("date").value;
  });
  $("resetButton").addEventListener("click", resetForm);
  $("cancelEdit").addEventListener("click", resetForm);
  $("refreshButton").addEventListener("click", load);
  load();
})();