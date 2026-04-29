import { useState } from "react";
import "./RatingsAndReviews.css";

// ── Sample data ──────────────────────────────────────────────────────────────
const INITIAL_REVIEWS = [
  {
    id: 1, name: "Rahul Sharma", avatar: "R", rating: 5, date: "April 20, 2026",
    title: "Absolutely loved this course!",
    body: "The content was well-structured and easy to follow. The hands-on practice section was my favourite part. Highly recommend to anyone starting out.",
    helpful: 24, voted: false,
  },
  {
    id: 2, name: "Priya Mehta", avatar: "P", rating: 4, date: "April 15, 2026",
    title: "Great for beginners",
    body: "Covers all the basics and more. I wish there were more advanced examples, but overall a solid course with great explanations.",
    helpful: 18, voted: false,
  },
  {
    id: 3, name: "Arjun Nair", avatar: "A", rating: 5, date: "April 10, 2026",
    title: "Best cooking course online!",
    body: "I've tried multiple platforms and this is by far the most comprehensive. The instructor's style is engaging and the content is very practical.",
    helpful: 31, voted: false,
  },
  {
    id: 4, name: "Sneha Kapoor", avatar: "S", rating: 3, date: "March 28, 2026",
    title: "Decent but could be better",
    body: "Some sections felt a bit rushed. Would appreciate more detailed explanations in the Advanced Topics lesson. Otherwise a good starting point.",
    helpful: 9, voted: false,
  },
];

const RATING_DIST = { 5: 68, 4: 20, 3: 7, 2: 3, 1: 2 };
const AVATAR_COLORS = { R:"#7c3aed", P:"#db2777", A:"#0ea5e9", S:"#10b981", M:"#f59e0b", default:"#6366f1" };
const STAR_LABELS = ["","Poor","Fair","Good","Very Good","Excellent"];

// ── Avatar ────────────────────────────────────────────────────────────────────
const Avatar = ({ letter, size = 40 }) => (
  <div className="rar-avatar" style={{ width:size, height:size, background: AVATAR_COLORS[letter]||AVATAR_COLORS.default, fontSize: size*0.4 }}>
    {letter}
  </div>
);

// ── Star SVG ──────────────────────────────────────────────────────────────────
const StarSVG = ({ filled, half, size, interactive, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    className={`rar-star${interactive ? " rar-star--interactive" : ""}`}
    width={size} height={size} viewBox="0 0 24 24"
    fill={filled ? "#f59e0b" : half ? "url(#rar-half)" : "none"}
    stroke={filled||half ? "#f59e0b" : "#d1d5db"} strokeWidth="1.5"
    onClick={onClick} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}
  >
    <defs>
      <linearGradient id="rar-half">
        <stop offset="50%" stopColor="#f59e0b"/>
        <stop offset="50%" stopColor="transparent"/>
      </linearGradient>
    </defs>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

// ── Stars Row ─────────────────────────────────────────────────────────────────
const Stars = ({ rating, size=18, center=false }) => (
  <div className={`rar-stars${center?" rar-stars--center":""}`}>
    {[1,2,3,4,5].map(s=>(
      <StarSVG key={s} size={size} filled={s<=Math.floor(rating)} half={s===Math.ceil(rating)&&rating%1>=0.5}/>
    ))}
  </div>
);

// ── Rating Bar ────────────────────────────────────────────────────────────────
const RatingBar = ({ star, pct }) => (
  <div className="rar-bar-row">
    <span className="rar-bar-row__label">{star}</span>
    <StarSVG size={13} filled/>
    <div className="rar-bar-row__track"><div className="rar-bar-row__fill" style={{width:`${pct}%`}}/></div>
    <span className="rar-bar-row__pct">{pct}%</span>
  </div>
);

// ── Review Card ───────────────────────────────────────────────────────────────
const ReviewCard = ({ review, onHelpful }) => (
  <div className="rar-card">
    <div className="rar-card__inner">
      <Avatar letter={review.avatar}/>
      <div className="rar-card__body">
        <div className="rar-card__top">
          <div className="rar-card__meta">
            <span className="rar-card__name">{review.name}</span>
            <span className="rar-card__date">{review.date}</span>
          </div>
          <Stars rating={review.rating} size={15}/>
        </div>
        <p className="rar-card__title">{review.title}</p>
        <p className="rar-card__text">{review.body}</p>
        <button className={`rar-helpful-btn${review.voted?" rar-helpful-btn--voted":""}`} onClick={()=>onHelpful(review.id)}>
          👍 Helpful ({review.helpful})
        </button>
      </div>
    </div>
  </div>
);

// ── Write Review Form ─────────────────────────────────────────────────────────
const WriteReviewForm = ({ onSubmit, onCancel }) => {
  const [hoverStar, setHoverStar] = useState(0);
  const [rating, setRating]       = useState(0);
  const [title, setTitle]         = useState("");
  const [body, setBody]           = useState("");
  const [error, setError]         = useState("");

  const handleSubmit = () => {
    if (!rating)                 return setError("Please select a star rating.");
    if (!title.trim())           return setError("Please add a review title.");
    if (body.trim().length < 20) return setError("Review must be at least 20 characters.");
    setError("");
    onSubmit({ rating, title, body });
  };

  const activeStar = hoverStar || rating;

  return (
    <div className="rar-form">
      <h3 className="rar-form__title">✍️ Write Your Review</h3>

      <div className="rar-form__group">
        <label className="rar-form__label">Your Rating *</label>
        <div className="rar-form__star-row">
          {[1,2,3,4,5].map(s=>(
            <StarSVG key={s} size={32} filled={s<=activeStar} interactive
              onMouseEnter={()=>setHoverStar(s)} onMouseLeave={()=>setHoverStar(0)}
              onClick={()=>setRating(s)}/>
          ))}
          {activeStar>0 && <span className="rar-form__star-hint">{STAR_LABELS[activeStar]}</span>}
        </div>
      </div>

      <div className="rar-form__group">
        <label className="rar-form__label">Review Title *</label>
        <input className="rar-input" placeholder="Summarise your experience…" value={title} onChange={e=>setTitle(e.target.value)}/>
      </div>

      <div className="rar-form__group">
        <label className="rar-form__label">Your Review *</label>
        <textarea className="rar-textarea" placeholder="What did you like or dislike? How was the content quality?" value={body} onChange={e=>setBody(e.target.value)}/>
        <div className="rar-form__char-count">{body.length} chars (min 20)</div>
      </div>

      {error && <div className="rar-form__error">⚠️ {error}</div>}

      <div className="rar-form__actions">
        <button className="rar-btn-submit" onClick={handleSubmit}>Submit Review</button>
        <button className="rar-btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function RatingsAndReviews() {
  const [reviews, setReviews]     = useState(INITIAL_REVIEWS);
  const [showForm, setShowForm]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter]       = useState(0);
  const [sort, setSort]           = useState("recent");

  const avgRating = (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1);

  const handleHelpful = (id) => setReviews(prev=>prev.map(r=>r.id===id?{...r,helpful:r.voted?r.helpful-1:r.helpful+1,voted:!r.voted}:r));

  const handleSubmit = ({ rating, title, body }) => {
    setReviews(prev=>[{id:Date.now(),name:"Anushka",avatar:"A",rating,date:"April 29, 2026",title,body,helpful:0,voted:false},...prev]);
    setShowForm(false);
    setSubmitted(true);
    setTimeout(()=>setSubmitted(false),3500);
  };

  const sorted = [...reviews]
    .filter(r=>filter===0||r.rating===filter)
    .sort((a,b)=>{
      if(sort==="helpful") return b.helpful-a.helpful;
      if(sort==="highest") return b.rating-a.rating;
      if(sort==="lowest")  return a.rating-b.rating;
      return b.id-a.id;
    });

  return (
    <div className="rar-root">

      <div className="rar-header">
        <div>
          <h2 className="rar-header__title">Ratings &amp; Reviews</h2>
          <p className="rar-header__subtitle">{reviews.length} reviews • verified learners only</p>
        </div>
        {!showForm && (
          <button className="rar-btn-primary" onClick={()=>setShowForm(true)}>+ Write a Review</button>
        )}
      </div>

      {submitted && <div className="rar-toast">✅ Your review has been submitted. Thank you for the feedback!</div>}

      <div className="rar-summary">
        <div className="rar-score">
          <div className="rar-score__number">{avgRating}</div>
          <Stars rating={parseFloat(avgRating)} size={20} center/>
          <div className="rar-score__label">Course Rating</div>
        </div>
        <div className="rar-bars">
          {[5,4,3,2,1].map(s=><RatingBar key={s} star={s} pct={RATING_DIST[s]}/>)}
        </div>
      </div>

      {showForm && (
        <div className="rar-form-wrap">
          <WriteReviewForm onSubmit={handleSubmit} onCancel={()=>setShowForm(false)}/>
        </div>
      )}

      <div className="rar-controls">
        <div className="rar-filters">
          {[0,5,4,3,2,1].map(val=>(
            <button key={val} className={`rar-filter-btn${filter===val?" rar-filter-btn--active":""}`} onClick={()=>setFilter(val)}>
              {val===0?"All":`${val} ★`}
            </button>
          ))}
        </div>
        <select className="rar-sort-select" value={sort} onChange={e=>setSort(e.target.value)}>
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      <div className="rar-list">
        {sorted.length===0
          ? <div className="rar-empty">No reviews for this filter yet.</div>
          : sorted.map(r=><ReviewCard key={r.id} review={r} onHelpful={handleHelpful}/>)
        }
      </div>
    </div>
  );
}
