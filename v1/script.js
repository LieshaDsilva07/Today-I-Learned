const CATEGORIES = [
  { name: "History", color: "#3b82f6" },
  { name: "Science", color: "#16a34a" },
  { name: "Tech", color: "#ef4444" },
  { name: "Psychology", color: "#eab308" },
  { name: "Space", color: "#db2777" },
  { name: "Unsolved Mysteries", color: "#14b8a6" },
];


//Select DOM elements
const btn = document.querySelector(".btn-open")
const form = document.querySelector(".fact-form")
const factsList = document.querySelector(".facts-list")

factsList.innerHTML="";
//Load data from supabase
async function LoadFacts(){
    const res = await fetch('https://jyhuaifdulvsjqvonqdy.supabase.co/rest/v1/Facts',{
    headers:{
        apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aHVhaWZkdWx2c2pxdm9ucWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3MTIsImV4cCI6MjA2OTIwMjcxMn0.FnUP_e01F06qKHs2Gb94fFuz-N_bM9wYy0xfJjkVrO0",
        authorization: 
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5aHVhaWZkdWx2c2pxdm9ucWR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2MjY3MTIsImV4cCI6MjA2OTIwMjcxMn0.FnUP_e01F06qKHs2Gb94fFuz-N_bM9wYy0xfJjkVrO0"
    }
});
const data = await res.json();
console.log(data);
CreateFactList(data);
}
LoadFacts()


function CreateFactList(dataArray){
  const HTMLFactArr = dataArray.map((fact) => {
    const color = CATEGORIES.find(category => category.name === fact.category)?.color || "#999";
    return `
      <li class="fact">
        <p>
          ${fact.text} 
          <a class="source" href="${fact.source}" target="_blank">(Source)</a>
        </p>
        <span class="tag" style="background-color: ${color}">${fact.category}</span>
      </li>
    `;
  });

  const html = HTMLFactArr.join("");
  factsList.insertAdjacentHTML("afterbegin", html);
}

//Toggle form
btn.addEventListener('click',function() {
    if(form.classList.contains('hidden')){
        form.classList.remove('hidden')
        btn.innerText = 'Close'
    }
    else{
        form.classList.add('hidden')
        btn.innerText = 'Share a Fact'
    }
})
