// SUPABASE SETUP
const supabaseUrl = "https://pjqwaaooafhlzjloqdtv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqcXdhYW9vYWZobHpqbG9xZHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMTksImV4cCI6MjA3MzE3NDIxOX0.AgI0p8vBXkWKk624fqX_uI5vcrPNwui5lpxC4ecZSc0";
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// DOM ELEMENTS
const authContainer = document.getElementById("auth-container");
const dashboard = document.getElementById("dashboard");
const signupBtn = document.getElementById("signup-btn");
const loginBtn = document.getElementById("login-btn");
const userNameEl = document.getElementById("user-name");
const interestsList = document.getElementById("interests-list");
const saveInterestsBtn = document.getElementById("save-interests");
const groupsList = document.getElementById("groups-list");
const notesList = document.getElementById("notes-list");
const postNoteBtn = document.getElementById("post-note");
const noteContent = document.getElementById("note-content");

// SAMPLE INTERESTS
const sampleInterests = ["Math", "Science", "Programming", "History", "Art", "Physics", "Chemistry", "Biology"];

function renderInterests() {
  interestsList.innerHTML = "";
  sampleInterests.forEach(interest => {
    const btn = document.createElement("button");
    btn.textContent = interest;
    btn.className = "shadcn-btn-secondary";
    btn.onclick = () => btn.classList.toggle("bg-blue-600");
    interestsList.appendChild(btn);
  });
}

// SIGNUP
signupBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;

  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) return alert(error.message);

  // Save profile in users table
  await supabase.from("users").insert([{ id: user.id, name }]);
  alert("Signup successful! Check email to confirm.");
};

// LOGIN
loginBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);

  authContainer.classList.add("hidden");
  dashboard.classList.remove("hidden");
  const { data: profile } = await supabase.from("users").select("*").eq("id", data.user.id).single();
  userNameEl.textContent = profile.name;

  renderInterests();
  loadGroups();
  loadNotes();
};

// LOAD GROUPS
async function loadGroups() {
  const { data, error } = await supabase.from("groups").select("*");
  groupsList.innerHTML = "";
  data.forEach(g => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h4 class="font-semibold mb-1">${g.name}</h4>
                     <input type="text" placeholder="Password" id="pw-${g.id}" class="input-field mb-1">
                     <button class="shadcn-btn" onclick="joinGroup('${g.id}')">Join Group</button>`;
    groupsList.appendChild(div);
  });
}

// JOIN GROUP
window.joinGroup = async (groupId) => {
  const pw = document.getElementById(`pw-${groupId}`).value;
  const { data: group } = await supabase.from("groups").select("*").eq("id", groupId).single();
  if (pw !== group.password) return alert("Wrong password");

  const newMembers = [...group.members, supabase.auth.user().id];
  await supabase.from("groups").update({ members: newMembers }).eq("id", groupId);
  alert("Joined group!");
};

// LOAD NOTES
async function loadNotes() {
  const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
  notesList.innerHTML = "";
  data.forEach(note => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<h4 class="font-semibold mb-1">${note.title || "Note"}</h4>
                     <p>${note.content}</p>`;
    notesList.appendChild(div);
  });
}

// POST NOTE
postNoteBtn.onclick = async () => {
  const content = noteContent.value;
  if (!content) return alert("Enter note content");
  const user = supabase.auth.user();

  await supabase.from("notes").insert([{ content, author_id: user.id }]);
  noteContent.value = "";
  loadNotes();
};
