import { useEffect, useState } from "react";
import "./styles.css";
import supabase from './supabase';


const CATEGORIES = [
  { name: "History", color: "#3b82f6" },
  { name: "Science", color: "#16a34a" },
  { name: "Tech", color: "#ef4444" },
  { name: "Psychology", color: "#eab308" },
  { name: "Space", color: "#db2777" },
  { name: "Unsolved Mysteries", color: "#14b8a6" },
];

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading,setisLoading]=useState(false);
  const [currentCat,setcurrentCat]=useState("all");

useEffect(function () {
  async function getFacts() {
    setisLoading(true);
    let query=supabase.from("Facts").select("*");
    if(currentCat !== "all"){
      query = query.eq("category",currentCat)
    }
    let { data: Facts, error } = await query
      .order("voteNice",{ascending: false})
      .limit(100)
      setFacts(Facts)
      setisLoading(false);

      console.log(error);
      console.log(Facts);

      if(!error) setFacts(Facts);
      else alert("There was a problem getting data!!");
      setisLoading(false)
  }

  getFacts();
}, [currentCat]);

  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />
      {showForm ? <FactForm setFacts={setFacts} setShowForm={setShowForm} /> : null}
      <main className="main">
        <CategoryList setcurrentCat = {setcurrentCat}/>
        {isLoading ? <Loader/> : <FactList facts={facts} setFacts={setFacts}/>}
      </main>
    </>
  );
}

function Loader(){
  return <p className="message">Loading...</p>
}

function Header({ showForm, setShowForm }) {
  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" alt="Today-i-Learned Logo" width="68" height="68" />
        <h1>Today I learned</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((s) => !s)}
      >
        {showForm ? "Close" : "Share a fact"}
      </button>
    </header>
  );
}

function isValidHttpUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function FactForm({ setFacts,setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [isUploading,setisUploading]=useState(false);

  const textLength = text.length;

async  function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && category && textLength <= 200) {
      // const newFact = {
      //   id: Math.round(Math.random() * 1000000),
      //   text,
      //   source,
      //   category,
      //   voteNice: 0,
      //   votesMindblowing: 0,
      //   voteWrong: 0,
      //   createdIn: new Date().getFullYear()
      // };
      setisUploading(true);
     const {data:newFact,error} = await supabase.from("Facts").insert([{text,source,category}]).select();
     if(!error) setFacts((facts) => [newFact[0], ...facts]);
     setisUploading(false);

      // Clear form
      setText("");
      setSource("");
      setCategory("");

      //Close form
      //setShowForm(false);
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Share a fact with the world..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      <input
        type="text"
        placeholder="Trustworthy source..."
        value={source}
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={isUploading}>
        <option value="">Choose category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading} >Post</button>
    </form>
  );
}

function FactList({ facts,setFacts }) {
  if (facts.length === 0)
    return <p className="message">No facts for this category yet! Create the first one</p>;

  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} factObj={fact} setFacts={setFacts} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database.</p>
    </section>
  );
}

function Fact({ factObj,setFacts }) {
  const [isUpdating,setisUpdating]=useState(false);
  const isDisputed = factObj.voteWrong > (factObj.voteNice + factObj.voteMindblowing);
  async function handleVote(columnName) {
    setisUpdating(true)
    const { data: updatedFact, error } = await supabase
      .from("Facts")
      .update({ [columnName]: factObj[columnName] + 1 })
      .eq("id", factObj.id)
      .select();
      setisUpdating(false)
    if (!error && updatedFact?.length > 0) {
      setFacts((facts) =>
        facts.map((f) => (f.id === factObj.id ? updatedFact[0] : f))
      );
    } else {
      console.error("Voting error:", error);
    }
  }

  return (
    <li className="fact">
      <p>
        {isDisputed ? <span className="disputed">[⛔️ DISPUTED] </span> : null}
        {factObj.text}{" "}
        <a
          className="source"
          href={factObj.source}
          target="_blank"
          rel="noreferrer"
        >
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor:
            CATEGORIES.find((c) => c.name === factObj.category)?.color || "#ccc"
        }}
      >
        {factObj.category}
      </span>
      <div className="vote-buttons">
        <button onClick={()=> handleVote ("voteNice")} disabled={isUpdating}>👍 {factObj.voteNice}</button>
        <button onClick={()=> handleVote ("voteMindblowing")} disabled={isUpdating}>🤯 {factObj.voteMindblowing}</button>
        <button onClick={()=> handleVote ("voteWrong")} disabled={isUpdating}>⛔️ {factObj.voteWrong}</button>
      </div>
    </li>
  );
}

function CategoryList({setcurrentCat}) {
  return (
    <aside>
      <ul>
        <li className="category">
          <button className="btn btn-all-categories" onClick={()=>setcurrentCat("all")}>All</button>
        </li>
        {CATEGORIES.map((cat) => (
          <li key={cat.name} className="category">
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={()=>setcurrentCat(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default App;
