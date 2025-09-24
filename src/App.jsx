import React, { useState, useEffect } from 'react';

// --- API Helper ---
async function apiFetch(url, options = {}, token) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let msg = '';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  try { return await res.json(); } catch { return {}; }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const handlePopState = e => setCurrentPage(e.state?.page || 'home');
    window.addEventListener('popstate', handlePopState);
    setCurrentPage(window.location.hash.replace('#', '') || 'home');
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      apiFetch('http://localhost:9090/api/quiz/attempts', {}, user.token)
        .then(() => setCurrentUser(user))
        .catch(() => localStorage.removeItem('currentUser'));
    }
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigateTo(page) {
    setCurrentPage(page);
    window.history.pushState({ page }, page, `#${page}`);
  }

  function handleLogin(user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    navigateTo(user.role === 'ADMIN' ? 'admin-panel' : 'user-panel');
  }

  function handleLogout() {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigateTo('home');
  }

  function renderPage() {
    switch (currentPage) {
      case 'home':       return <HomePage navigateTo={navigateTo} currentUser={currentUser} />;
      case 'about':      return <AboutPage />;
      case 'login':      return currentUser ? navigateTo('home') : <LoginPage onLogin={handleLogin} />;
      case 'admin-panel':return currentUser?.role === 'ADMIN' ? <AdminPanel currentUser={currentUser} /> : navigateTo('home');
      case 'user-panel': return currentUser?.role === 'USER' ? <UserPanel currentUser={currentUser} navigateTo={navigateTo} /> : navigateTo('home');
      case 'quiz':       return <QuizList currentUser={currentUser} navigateTo={navigateTo} />;
      case 'quiz-attempt':return <QuizAttempt currentUser={currentUser} navigateTo={navigateTo} />;
      default:           return <HomePage navigateTo={navigateTo} currentUser={currentUser} />;
    }
  }

  return (
    <div style={styles.app}>
      <Header currentUser={currentUser} navigateTo={navigateTo} onLogout={handleLogout} />
      <main style={styles.main}>
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}

// --- Header ---
function Header({ currentUser, navigateTo, onLogout }) {
  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <div style={styles.logo} onClick={() => navigateTo('home')}>
          QuizMaster Pro
        </div>
        <div style={styles.navLinks}>
          <NavLink label="Home" target="home" navigateTo={navigateTo} />
          <NavLink label="About" target="about" navigateTo={navigateTo} />
          <NavLink label="Quizzes" target="quiz" navigateTo={navigateTo} />
          {currentUser ? (
            <>
              <span style={styles.userWelcome}>Hi, {currentUser.name || currentUser.email}!</span>
              <NavLink label="Dashboard" target={currentUser.role === 'ADMIN' ? 'admin-panel' : 'user-panel'} navigateTo={navigateTo} />
              <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
            </>
          ) : (
            <NavLink label="Login" target="login" navigateTo={navigateTo} />
          )}
        </div>
      </nav>
    </header>
  );
}

function NavLink({ label, target, navigateTo }) {
  return (
    <a href={`#${target}`} onClick={e => { e.preventDefault(); navigateTo(target); }} style={styles.navLink}>
      {label}
    </a>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer style={styles.footer}>
      © {new Date().getFullYear()} QuizMaster Pro. All Rights Reserved.
    </footer>
  );
}

// --- Home Page ---
function HomePage({ currentUser, navigateTo }) {
  return (
    <div style={styles.homePage}>
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>Welcome to QuizMaster Pro</h1>
          <p style={styles.heroSubtitle}>
            {currentUser 
              ? `Welcome back, ${currentUser.name || currentUser.email}! Ready for your next challenge?` 
              : 'Test your knowledge with our interactive quizzes and track your progress!'
            }
          </p>
          <div style={styles.heroButtons}>
            <button onClick={() => navigateTo('quiz')} style={styles.primaryBtn}>
              Start Quiz
            </button>
            <button onClick={() => navigateTo('about')} style={styles.secondaryBtn}>
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🧠</div>
          <h3>Multiple Quiz Types</h3>
          <p>Choose from multiple choice, true/false, and text-based questions</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>⏱️</div>
          <h3>Timed Challenges</h3>
          <p>Race against time with our exciting timed quiz challenges</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📊</div>
          <h3>Track Progress</h3>
          <p>Monitor your performance and see detailed score breakdowns</p>
        </div>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🏆</div>
          <h3>Leaderboards</h3>
          <p>Compete with others and climb the global leaderboards</p>
        </div>
      </div>
    </div>
  );
}

// --- About Page ---
function AboutPage() {
  return (
    <div style={styles.aboutPage}>
      <div style={styles.aboutContent}>
        <h2 style={styles.aboutTitle}>About QuizMaster Pro</h2>
        <div style={styles.aboutText}>
          <p>QuizMaster Pro is a comprehensive quiz platform designed to make learning fun and engaging. Whether you're a student looking to test your knowledge or an educator creating assessments, our platform provides all the tools you need.</p>
          
          <h3>Features</h3>
          <ul>
            <li>Multiple question types (Multiple Choice, True/False, Text)</li>
            <li>Timed quizzes for added challenge</li>
            <li>Detailed scoring and analytics</li>
            <li>User dashboard for tracking progress</li>
            <li>Admin panel for quiz management</li>
            <li>Leaderboards and score comparison</li>
          </ul>
          
          <h3>How it Works</h3>
          <p>Simply create an account, browse available quizzes, and start testing your knowledge. Each quiz attempt is tracked, allowing you to see your improvement over time. Administrators can create and manage quizzes with our intuitive quiz builder.</p>
        </div>
      </div>
    </div>
  );
}

// --- Login Page ---
function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const url = isSignup ? 'http://localhost:9090/api/auth/signup' : 'http://localhost:9090/api/auth/login';
      const body = isSignup ? JSON.stringify({ name, email, password }) : JSON.stringify({ email, password });
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Auth failed');
      if (isSignup) {
        alert('Signup successful! Please login.');
        setIsSignup(false);
        setName('');
        setEmail('');
        setPassword('');
      } else {
        onLogin(data);
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div style={styles.loginPage}>
      <form onSubmit={handleSubmit} style={styles.loginForm}>
        <h2 style={styles.formTitle}>{isSignup ? 'Create Account' : 'Welcome Back'}</h2>
        <p style={styles.formSubtitle}>
          {isSignup ? 'Join QuizMaster Pro today' : 'Sign in to your account'}
        </p>
        
        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            style={styles.input}
          />
        )}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        
        {error && <div style={styles.error}>{error}</div>}
        
        <button disabled={loading} style={styles.submitBtn}>
          {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In')}
        </button>
        
        <p style={styles.toggleAuth}>
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <a href="#!" onClick={e => { e.preventDefault(); setIsSignup(!isSignup); }} style={styles.toggleLink}>
            {isSignup ? 'Sign In' : 'Create Account'}
          </a>
        </p>
      </form>
    </div>
  );
}

// --- User Panel ---
function UserPanel({ currentUser, navigateTo }) {
  const [tab, setTab] = useState('dashboard');
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAttempts(); }, []);

  async function fetchAttempts() {
    setLoading(true);
    try {
      const data = await apiFetch('http://localhost:9090/api/quiz/attempts', {}, currentUser.token);
      setAttempts(Array.isArray(data) ? data : []);
    } catch (err) {}
    setLoading(false);
  }

  function getScoreCard(attempt) {
    const percentage = Math.round(attempt.correctAnswers / attempt.totalQuestions * 100);
    const scoreColor = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
    
    return (
      <div style={{ ...styles.scoreCard, borderLeft: `4px solid ${scoreColor}` }}>
        <h3 style={styles.scoreTitle}>{attempt.quizTitle}</h3>
        <div style={styles.scoreStats}>
          <div style={styles.scoreStat}>
            <span style={styles.scoreLabel}>Score</span>
            <span style={{ ...styles.scoreValue, color: scoreColor }}>{percentage}%</span>
          </div>
          <div style={styles.scoreStat}>
            <span style={styles.scoreLabel}>Correct</span>
            <span style={styles.scoreValue}>{attempt.correctAnswers}</span>
          </div>
          <div style={styles.scoreStat}>
            <span style={styles.scoreLabel}>Incorrect</span>
            <span style={styles.scoreValue}>{attempt.totalQuestions - attempt.correctAnswers}</span>
          </div>
        </div>
        <div style={styles.scoreDate}>
          {new Date(attempt.completedAt).toLocaleDateString()}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.userPanel}>
      <h2 style={styles.panelTitle}>My Dashboard</h2>
      <nav style={styles.tabNav}>
        <button 
          onClick={() => setTab('dashboard')} 
          style={tab === 'dashboard' ? styles.activeTab : styles.tab}
        >
          Quiz History
        </button>
        <button 
          onClick={() => setTab('result')} 
          style={tab === 'result' ? styles.activeTab : styles.tab}
        >
          Latest Result
        </button>
      </nav>
      
      {tab === 'dashboard' && (
        <div style={styles.tabContent}>
          <h3>Previous Quiz Attempts</h3>
          {loading && <div style={styles.loading}>Loading your quiz history...</div>}
          {!loading && attempts.length === 0 && (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📝</div>
              <p>No quiz attempts yet. Take your first quiz!</p>
              <button onClick={() => navigateTo('quiz')} style={styles.primaryBtn}>
                Browse Quizzes
              </button>
            </div>
          )}
          {!loading && attempts.map(attempt => getScoreCard(attempt))}
        </div>
      )}
      
      {tab === 'result' && window.quizResult && (
        <div style={styles.tabContent}>
          <h3>Latest Quiz Result</h3>
          {getScoreCard(window.quizResult)}
          <button
            onClick={() => { window.quizResult = null; navigateTo('quiz'); }}
            style={styles.primaryBtn}
          >
            Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

// --- Quiz List WITH SEARCH FUNCTIONALITY ---
function QuizList({ currentUser, navigateTo }) {
  const [scoreboardData, setScoreboardData] = useState([]);
  const [showScoreboardModal, setShowScoreboardModal] = useState(false);
  const [scoreboardLoading, setScoreboardLoading] = useState(false);
  const [scoreboardQuizTitle, setScoreboardQuizTitle] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchData() {
      const qs = await apiFetch('http://localhost:9090/api/quiz', {}, currentUser?.token);
      const quizList = Array.isArray(qs) ? qs : [];
      setQuizzes(quizList);
      setFilteredQuizzes(quizList);
      if (currentUser)
        setAttempts(await apiFetch('http://localhost:9090/api/quiz/attempts', {}, currentUser.token));
      setLoading(false);
    }
    fetchData();
  }, [currentUser]);

  // Filter quizzes based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredQuizzes(quizzes);
    } else {
      const filtered = quizzes.filter(quiz =>
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredQuizzes(filtered);
    }
  }, [searchTerm, quizzes]);

  function handleSearchChange(e) {
    setSearchTerm(e.target.value);
  }

  function clearSearch() {
    setSearchTerm('');
  }

  async function showScoreboard(quizId, quizTitle) {
    setScoreboardLoading(true);
    try {
      const results = await apiFetch(`http://localhost:9090/api/quiz/${quizId}/scoreboard`, {}, currentUser.token);
      setScoreboardData(results);
      setScoreboardQuizTitle(quizTitle);
      setShowScoreboardModal(true);
    } catch (err) {
      alert('Failed to load scoreboard: ' + err.message);
    } finally {
      setScoreboardLoading(false);
    }
  }

  function formatTimeMMSS(totalSeconds) {
    if (totalSeconds == null || isNaN(totalSeconds)) return '00:00';
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function alreadyAttempted(quizId) {
    return attempts.find(a => a.quizId === quizId);
  }

  return (
    <>
      <div style={styles.quizListPage}>
        <h2 style={styles.pageTitle}>Available Quizzes</h2>
        
        {/* Search Section */}
        <div style={styles.searchSection}>
          <div style={styles.searchContainer}>
            <div style={styles.searchInputContainer}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search quizzes by title..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={styles.searchInput}
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  style={styles.clearSearchBtn}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          
          {/* Search Results Info */}
          {searchTerm && (
            <div style={styles.searchInfo}>
              {filteredQuizzes.length === 0 ? (
                <span style={styles.noResults}>
                  No quizzes found for "{searchTerm}"
                </span>
              ) : (
                <span style={styles.searchResults}>
                  Found {filteredQuizzes.length} quiz{filteredQuizzes.length !== 1 ? 'es' : ''} matching "{searchTerm}"
                </span>
              )}
            </div>
          )}
        </div>

        {loading && <div style={styles.loading}>Loading quizzes...</div>}
        
        {/* Display filtered quizzes or empty state */}
        {!loading && filteredQuizzes.length === 0 && !searchTerm && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📚</div>
            <p>No quizzes available at the moment.</p>
          </div>
        )}

        {!loading && filteredQuizzes.length === 0 && searchTerm && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p>No quizzes found matching your search.</p>
            <p style={styles.searchSuggestion}>Try searching with different keywords or <button onClick={clearSearch} style={styles.linkBtn}>clear the search</button></p>
          </div>
        )}

        <div style={styles.quizGrid}>
          {filteredQuizzes.map(q => {
            const attempted = alreadyAttempted(q.id);
            return (
              <div key={q.id} style={styles.quizCard}>
                <div style={styles.quizCardHeader}>
                  <h3 style={styles.quizTitle}>{q.title}</h3>
                  <div style={styles.quizBadge}>
                    {q.totalQuestions || q.questions?.length || 0} Questions
                  </div>
                </div>
                
                <p style={styles.quizDescription}>{q.description}</p>
                
                <div style={styles.quizMeta}>
                  <span>⏱️ {q.timeLimitMinutes} minutes</span>
                  <span>📊 {attempted ? 'Completed' : 'Available'}</span>
                </div>
                
                <div style={styles.quizActions}>
                  {!currentUser && (
                    <button onClick={() => navigateTo('login')} style={styles.primaryBtn}>
                      Login to Start
                    </button>
                  )}
                  
                  {currentUser && attempted && (
                    <button 
                      onClick={() => { window.quizResult = attempted; navigateTo('user-panel'); }} 
                      style={styles.completedBtn}
                    >
                      View Results
                    </button>
                  )}
                  
                  {currentUser && !attempted && (
                    <button onClick={async () => {
                      try {
                        const attempt = await apiFetch(`http://localhost:9090/api/quiz/${q.id}/start`, { method: 'POST' }, currentUser.token);
                        window.quizAttemptId = attempt.id;
                        window.currentQuizId = q.id;
                        navigateTo('quiz-attempt');
                      } catch (err) {
                        alert(err.message);
                      }
                    }} style={styles.primaryBtn}>
                      Start Quiz
                    </button>
                  )}
                  
                  <button 
                    onClick={() => showScoreboard(q.id, q.title)} 
                    style={styles.secondaryBtn}
                  >
                    Leaderboard
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showScoreboardModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2>🏆 Leaderboard - {scoreboardQuizTitle}</h2>
              <button onClick={() => setShowScoreboardModal(false)} style={styles.closeBtn}>×</button>
            </div>
            
            {scoreboardLoading ? (
              <div style={styles.loading}>Loading leaderboard...</div>
            ) : (
              <div style={styles.leaderboard}>
                {scoreboardData.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>🎯</div>
                    <p>No attempts yet. Be the first to take this quiz!</p>
                  </div>
                ) : (
                  scoreboardData.map((a, index) => (
                    <div key={a.id} style={styles.leaderboardItem}>
                      <div style={styles.rank}>#{index + 1}</div>
                      <div style={styles.playerInfo}>
                        <div style={styles.playerName}>{a.userName}</div>
                        <div style={styles.playerStats}>
                          {a.correctAnswers}/{a.totalQuestions} correct • {formatTimeMMSS(a.timeTakenSeconds)}
                        </div>
                      </div>
                      <div style={styles.playerScore}>{a.score}%</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// --- Quiz Attempt ---
function QuizAttempt({ currentUser, navigateTo }) {
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let interval;
    async function init() {
      if (!currentUser || !window.currentQuizId || !window.quizAttemptId) {
        navigateTo('quiz');
        return;
      }
      const quizData = await apiFetch(`http://localhost:9090/api/quiz/${window.currentQuizId}`, {}, currentUser.token);
      setQuiz(quizData);
      setTimeRemaining(quizData.timeLimitMinutes * 60);
    }
    init();
    interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev > 0) return prev - 1;
        else {
          handleSubmit();
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  function handleAnswerSelect(questionId, selectedOptionId, textAnswer = null) {
    setAnswers(prev => ({ ...prev, [questionId]: { selectedOptionId, textAnswer } }));
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const submissionAnswers = Object.entries(answers).map(([qId, ans]) => ({
        questionId: Number(qId),
        selectedOptionId: ans.selectedOptionId,
        textAnswer: ans.textAnswer
      }));

      const elapsedSeconds = Math.ceil((quiz.timeLimitMinutes * 60) - timeRemaining);
      const body = JSON.stringify({
        quizAttemptId: window.quizAttemptId,
        answers: submissionAnswers,
        timeTakenSeconds: elapsedSeconds
      });

      const res = await fetch('http://localhost:9090/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.token}` },
        body
      });

      if (!res.ok) throw new Error('Failed to submit quiz');
      const result = await res.json();
      window.quizResult = result;
      navigateTo('user-panel');
    } catch (err) {
      alert(err.message);
    }
    setSubmitting(false);
  }

  if (!quiz) return <div style={styles.loading}>Loading quiz...</div>;

  const question = quiz.questions[currentQuestionIndex];
  const total = quiz.questions.length;
  const progressPercent = ((currentQuestionIndex + 1) / total) * 100;
  const timeWarning = timeRemaining <= 60;

  return (
    <div style={styles.quizAttemptPage}>
      <div style={styles.quizHeader}>
        <h2 style={styles.quizAttemptTitle}>{quiz.title}</h2>
        <div style={{ ...styles.timer, color: timeWarning ? '#ef4444' : '#6b7280' }}>
          ⏰ {formatTime(timeRemaining)}
        </div>
      </div>
      
      <div style={styles.progressSection}>
        <div style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {total}
        </div>
        <div style={styles.progressBar}>
          <div 
            style={{ 
              ...styles.progressFill, 
              width: `${progressPercent}%` 
            }} 
          />
        </div>
      </div>

      <div style={styles.questionCard}>
        <h3 style={styles.questionText}>{question.questionText}</h3>

        {question.type === 'MULTIPLE_CHOICE' && question.options && (
          <div style={styles.optionsContainer}>
            {question.options.map(option => (
              <label key={option.id} style={styles.optionLabel}>
                <input 
                  type="radio" 
                  name={`q-${question.id}`}
                  checked={answers[question.id]?.selectedOptionId === option.id}
                  onChange={() => handleAnswerSelect(question.id, option.id)}
                  style={styles.radioInput}
                />
                <span style={styles.optionText}>{option.optionText}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'TRUE_FALSE' && (
          <div style={styles.optionsContainer}>
            {['True', 'False'].map(opt => (
              <label key={opt} style={styles.optionLabel}>
                <input 
                  type="radio" 
                  name={`q-${question.id}`}
                  checked={answers[question.id]?.textAnswer === opt}
                  onChange={() => handleAnswerSelect(question.id, null, opt)}
                  style={styles.radioInput}
                />
                <span style={styles.optionText}>{opt}</span>
              </label>
            ))}
          </div>
        )}

        {question.type === 'TEXT' && (
          <textarea
            value={answers[question.id]?.textAnswer || ''}
            onChange={e => handleAnswerSelect(question.id, null, e.target.value)}
            placeholder="Type your answer here..."
            style={styles.textInput}
          />
        )}
      </div>

      <div style={styles.navigationButtons}>
        <button
          disabled={currentQuestionIndex === 0}
          onClick={() => setCurrentQuestionIndex(i => i - 1)}
          style={currentQuestionIndex === 0 ? styles.disabledBtn : styles.secondaryBtn}
        >
          ← Previous
        </button>
        
        {currentQuestionIndex + 1 === total ? (
          <button 
            disabled={submitting} 
            onClick={handleSubmit} 
            style={styles.submitQuizBtn}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button 
            onClick={() => setCurrentQuestionIndex(i => i + 1)} 
            style={styles.primaryBtn}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}

// --- Admin Panel ---
function AdminPanel({ currentUser, navigateTo }) {
  const [tab, setTab] = useState('dashboard');
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizForm, setQuizForm] = useState({
    id: null,
    title: '',
    description: '',
    timeLimitMinutes: 30,
    isActive: true,
    questions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const data = await apiFetch('http://localhost:9090/api/quiz', {}, currentUser.token);
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function showResults(quizId) {
    setSelectedQuiz(quizId);
    try {
      const data = await apiFetch(
        `http://localhost:9090/api/quiz/${quizId}/attempts`,
        {}, currentUser.token
      );
      setAttempts(Array.isArray(data)
        ? data.sort((a,b) => b.correctAnswers - a.correctAnswers)
        : []);
      setTab('results');
    } catch (e) { console.error(e); setAttempts([]); }
  }

  function startCreateQuiz() {
    setQuizForm({ id:null, title:'', description:'', timeLimitMinutes:30, isActive:true, questions:[] });
    setShowQuizForm(true);
  }

  async function startEditQuiz(q) {
    try {
      const dto = await apiFetch(`http://localhost:9090/api/quiz/${q.id}`, {}, currentUser.token);
      const questions = dto.questions.map(qd => ({
        id: qd.id,
        questionText: qd.questionText,
        type: qd.type,
        points: qd.points,
        options: qd.options.map(o => ({ id:o.id, optionText:o.optionText, isCorrect:false })),
        correctOptionIndex: null,
        correctText: qd.correctText || ''
      }));
      setQuizForm({
        id:dto.id,
        title:dto.title,
        description:dto.description,
        timeLimitMinutes:dto.timeLimitMinutes,
        isActive:dto.isActive,
        questions
      });
      setShowQuizForm(true);
    } catch (e) { alert('Cannot load quiz: '+e.message); }
  }

  async function handleCopyQuiz(q) {
    try {
      const dto = await apiFetch(`http://localhost:9090/api/quiz/${q.id}`, {}, currentUser.token);
      const questions = dto.questions.map(qd => ({
        id: null,
        questionText: qd.questionText,
        type: qd.type,
        points: qd.points,
        options: qd.options.map(o => ({
          id: null,
          optionText: o.optionText,
          isCorrect: o.isCorrect || false
        })),
        correctOptionIndex: qd.options.findIndex(o => o.isCorrect),
        correctText: qd.correctText || ''
      }));
      setQuizForm({
        id: null,
        title: `Copy of ${dto.title}`,
        description: dto.description,
        timeLimitMinutes: dto.timeLimitMinutes,
        isActive: dto.isActive,
        questions
      });
      setShowQuizForm(true);
    } catch (error) {
      alert('Failed to copy quiz: ' + error.message);
    }
  }

  async function handleQuizSave() {
    if (!quizForm.title.trim() || quizForm.questions.length < 1) {
      alert('Title and at least 1 question required'); return;
    }
    for (const q of quizForm.questions) {
      if (!q.questionText.trim()) { alert('All questions need text'); return; }
      if (q.type !== 'TEXT') {
        if (q.options.length < 2) { alert('Need options'); return; }
        if (!q.options.some(o => o.isCorrect)) { alert('Select correct option'); return; }
      } else if (!q.correctText.trim()) {
        alert('Text questions need correct answer'); return;
      }
    }
    const payload = {
      title: quizForm.title,
      description: quizForm.description,
      timeLimitMinutes: quizForm.timeLimitMinutes,
      isActive: quizForm.isActive,
      questions: quizForm.questions.map(q => ({
        questionText: q.questionText,
        type: q.type,
        points: q.points,
        options: q.type === 'TEXT' ? [] : q.options.map(o => ({ optionText: o.optionText })),
        correctOptionIndex: q.type === 'TEXT' ? undefined : q.options.findIndex(o => o.isCorrect),
        correctText: q.type === 'TEXT' ? q.correctText : undefined
      }))
    };
    try {
      if (quizForm.id) {
        await apiFetch(
          `http://localhost:9090/api/quiz/${quizForm.id}`,
          { method: 'PUT', body: JSON.stringify(payload) },
          currentUser.token
        );
      } else {
        await apiFetch(
          'http://localhost:9090/api/quiz',
          { method: 'POST', body: JSON.stringify(payload) },
          currentUser.token
        );
      }
      setShowQuizForm(false);
      fetchDashboardData();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  }

  async function handleQuizDelete(id) {
    if (!window.confirm('Delete permanently?')) return;
    try {
      await apiFetch(`http://localhost:9090/api/quiz/${id}`, { method: 'DELETE' }, currentUser.token);
      fetchDashboardData();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  }

  function renderQuizForm() {
    return (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3>{quizForm.id ? 'Edit Quiz' : 'Create New Quiz'}</h3>
            <button onClick={() => setShowQuizForm(false)} style={styles.closeBtn}>×</button>
          </div>
          
          <div style={styles.formContainer}>
            <input
              type="text"
              placeholder="Quiz Title"
              value={quizForm.title}
              onChange={e => setQuizForm(f => ({ ...f, title: e.target.value }))}
              style={styles.input}
            />
            <textarea
              placeholder="Quiz Description"
              value={quizForm.description}
              onChange={e => setQuizForm(f => ({ ...f, description: e.target.value }))}
              style={styles.textarea}
            />
            <input
              type="number"
              min={1}
              placeholder="Time limit (minutes)"
              value={quizForm.timeLimitMinutes}
              onChange={e => setQuizForm(f => ({ ...f, timeLimitMinutes: +e.target.value }))}
              style={styles.input}
            />
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={quizForm.isActive}
                onChange={e => setQuizForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <span>Active Quiz</span>
            </label>
            
            <h4>Questions</h4>
            {quizForm.questions.map((q, i) => (
              <div key={i} style={styles.questionForm}>
                <input
                  type="text"
                  placeholder="Question text"
                  value={q.questionText}
                  onChange={e => {
                    const qs = [...quizForm.questions];
                    qs[i].questionText = e.target.value;
                    setQuizForm(f => ({ ...f, questions: qs }));
                  }}
                  style={styles.input}
                />
                <select
                  value={q.type}
                  onChange={e => {
                    const qs = [...quizForm.questions];
                    qs[i].type = e.target.value;
                    if (e.target.value === 'TEXT') {
                      qs[i].options = [];
                      qs[i].correctText = '';
                    }
                    setQuizForm(f => ({ ...f, questions: qs }));
                  }}
                  style={styles.select}
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TRUE_FALSE">True/False</option>
                  <option value="TEXT">Text</option>
                </select>
                <input
                  type="number"
                  min={1}
                  placeholder="Points"
                  value={q.points}
                  onChange={e => {
                    const qs = [...quizForm.questions];
                    qs[i].points = +e.target.value;
                    setQuizForm(f => ({ ...f, questions: qs }));
                  }}
                  style={styles.input}
                />
                
                {q.type === 'TEXT' && (
                  <input
                    type="text"
                    placeholder="Correct answer"
                    value={q.correctText}
                    onChange={e => {
                      const qs = [...quizForm.questions];
                      qs[i].correctText = e.target.value;
                      setQuizForm(f => ({ ...f, questions: qs }));
                    }}
                    style={styles.input}
                  />
                )}
                
                {(q.type === 'MULTIPLE_CHOICE' || q.type === 'TRUE_FALSE') && (
                  <>
                    <h5>Options</h5>
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={styles.optionForm}>
                        <input
                          type="radio"
                          checked={opt.isCorrect}
                          name={`correct-${i}`}
                          onChange={() => {
                            const qs = [...quizForm.questions];
                            qs[i].options = qs[i].options.map((oo, idx) => ({
                              ...oo,
                              isCorrect: idx === oi
                            }));
                            setQuizForm(f => ({ ...f, questions: qs }));
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Option text"
                          value={opt.optionText}
                          onChange={e => {
                            const qs = [...quizForm.questions];
                            qs[i].options[oi].optionText = e.target.value;
                            setQuizForm(f => ({ ...f, questions: qs }));
                          }}
                          style={styles.input}
                        />
                        {q.options.length > 2 && (
                          <button onClick={() => {
                            const qs = [...quizForm.questions];
                            qs[i].options.splice(oi, 1);
                            setQuizForm(f => ({ ...f, questions: qs }));
                          }} style={styles.deleteBtn}>Delete</button>
                        )}
                      </div>
                    ))}
                    {q.options.length < 4 && (
                      <button onClick={() => {
                        const qs = [...quizForm.questions];
                        qs[i].options.push({ id: null, optionText: '', isCorrect: false });
                        setQuizForm(f => ({ ...f, questions: qs }));
                      }} style={styles.addBtn}>Add Option</button>
                    )}
                  </>
                )}
                
                <button onClick={() => {
                  const qs = [...quizForm.questions];
                  qs.splice(i, 1);
                  setQuizForm(f => ({ ...f, questions: qs }));
                }} style={styles.deleteBtn}>Remove Question</button>
              </div>
            ))}
            
            <button onClick={() => {
              setQuizForm(f => ({
                ...f,
                questions: [...f.questions, { 
                  id: null, 
                  questionText: '', 
                  type: 'MULTIPLE_CHOICE', 
                  points: 1, 
                  options: [{ id: null, optionText: '', isCorrect: true }], 
                  correctOptionIndex: null, 
                  correctText: '' 
                }]
              }));
            }} style={styles.addBtn}>+ Add Question</button>
            
            <div style={styles.formActions}>
              <button onClick={() => setShowQuizForm(false)} style={styles.secondaryBtn}>Cancel</button>
              <button onClick={handleQuizSave} style={styles.primaryBtn}>Save Quiz</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <div style={styles.loading}>Loading admin panel...</div>;

  return (
    <div style={styles.adminPanel}>
      <h2 style={styles.panelTitle}>Admin Dashboard</h2>
      <nav style={styles.tabNav}>
        <button onClick={() => setTab('dashboard')} style={tab === 'dashboard' ? styles.activeTab : styles.tab}>Overview</button>
        <button onClick={() => setTab('quizzes')} style={tab === 'quizzes' ? styles.activeTab : styles.tab}>Manage Quizzes</button>
        <button onClick={() => setTab('results')} style={tab === 'results' ? styles.activeTab : styles.tab} disabled={!selectedQuiz}>Quiz Results</button>
      </nav>
      
      {tab === 'dashboard' && (
        <div style={styles.tabContent}>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{quizzes.length}</div>
              <div style={styles.statLabel}>Total Quizzes</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{quizzes.filter(q => q.isActive).length}</div>
              <div style={styles.statLabel}>Active Quizzes</div>
            </div>
          </div>
        </div>
      )}
      
      {tab === 'quizzes' && (
        <div style={styles.tabContent}>
          <button onClick={startCreateQuiz} style={styles.primaryBtn}>Create New Quiz</button>
          
          <div style={styles.quizGrid}>
            {quizzes.map(q => (
              <div key={q.id} style={styles.adminQuizCard}>
                <h3 style={styles.quizTitle}>{q.title}</h3>
                <p style={styles.quizDescription}>{q.description}</p>
                <div style={styles.quizMeta}>
                  <span>📝 {q.totalQuestions || q.questions?.length || 0} questions</span>
                  <span>⏱️ {q.timeLimitMinutes} min</span>
                  <span style={{ color: q.isActive ? '#10b981' : '#ef4444' }}>
                    {q.isActive ? '✅ Active' : '❌ Inactive'}
                  </span>
                </div>
                
                <div style={styles.adminActions}>
                  <button onClick={() => startEditQuiz(q)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleCopyQuiz(q)} style={styles.copyBtn}>Copy</button>
                  <button onClick={() => showResults(q.id)} style={styles.viewBtn}>Results</button>
                  <button onClick={() => handleQuizDelete(q.id)} style={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {tab === 'results' && (
        <div style={styles.tabContent}>
          <h3>Quiz Results</h3>
          {attempts.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📊</div>
              <p>No attempts for this quiz yet.</p>
            </div>
          ) : (
            <div style={styles.resultsTable}>
              <div style={styles.tableHeader}>
                <span>User</span>
                <span>Score</span>
                <span>Correct</span>
                <span>Incorrect</span>
                <span>Date</span>
              </div>
              {attempts.map(a => (
                <div key={a.id} style={styles.tableRow}>
                  <span>{a.userName}</span>
                  <span>{Math.round(a.correctAnswers / a.totalQuestions * 100)}%</span>
                  <span>{a.correctAnswers}</span>
                  <span>{a.totalQuestions - a.correctAnswers}</span>
                  <span>{new Date(a.completedAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setTab('quizzes')} style={styles.secondaryBtn}>Back to Quizzes</button>
        </div>
      )}
      
      {showQuizForm && renderQuizForm()}
    </div>
  );
}

// --- Updated Styles with Search Styles ---
const styles = {
  app: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column'
  },
  
  // Header
  header: {
    backgroundColor: '#ffffff',
    padding: '1rem 2rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#3b82f6',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  navLink: {
    color: '#374151',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    transition: 'all 0.2s',
    cursor: 'pointer'
  },
  userWelcome: {
    color: '#6b7280',
    fontWeight: '500'
  },
  logoutBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  // Main content
  main: {
    flexGrow: 1,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  
  // Search Section Styles
  searchSection: {
    marginBottom: '2rem'
  },
  searchContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1rem'
  },
  searchInputContainer: {
    position: 'relative',
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '1rem',
    fontSize: '1.125rem',
    color: '#9ca3af',
    zIndex: 1
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem 0.75rem 2.5rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    backgroundColor: 'white',
    outline: 'none',
    transition: 'all 0.2s',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    boxSizing: 'border-box'
  },
  clearSearchBtn: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    color: '#9ca3af',
    fontSize: '1.25rem',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '50%',
    transition: 'all 0.2s'
  },
  searchInfo: {
    textAlign: 'center',
    marginTop: '0.5rem'
  },
  searchResults: {
    color: '#059669',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  noResults: {
    color: '#ef4444',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  searchSuggestion: {
    color: '#6b7280',
    fontSize: '0.875rem',
    marginTop: '0.5rem'
  },
  linkBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '0.875rem'
  },
  
  // Home page
  homePage: {
    textAlign: 'center'
  },
  hero: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '1rem',
    padding: '4rem 2rem',
    color: 'white',
    marginBottom: '3rem'
  },
  heroContent: {
    maxWidth: '600px',
    margin: '0 auto'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: '800',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    marginBottom: '2rem',
    opacity: 0.9
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  
  // Features section
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
    marginTop: '3rem'
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s'
  },
  featureIcon: {
    fontSize: '3rem',
    marginBottom: '1rem'
  },
  
  // About page
  aboutPage: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  aboutContent: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '3rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
  },
  aboutTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem'
  },
  aboutText: {
    lineHeight: '1.8',
    color: '#374151'
  },
  
  // Login page
  loginPage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh'
  },
  loginForm: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '3rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
    border: '1px solid #e5e7eb'
  },
  formTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '0.5rem',
    textAlign: 'center'
  },
  formSubtitle: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '2rem'
  },
  
  // Form elements
  input: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    margin: '0.5rem 0',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  textInput: {
    width: '100%',
    padding: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    minHeight: '120px',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    margin: '1rem 0'
  },
  
  // Buttons
  primaryBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  secondaryBtn: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s'
  },
  completedBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  disabledBtn: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'not-allowed'
  },
  submitQuizBtn: {
    backgroundColor: '#059669',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  
  // Admin buttons
  editBtn: {
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  copyBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  viewBtn: {
    backgroundColor: '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  deleteBtn: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  addBtn: {
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    margin: '0.5rem 0'
  },
  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0.25rem'
  },
  
  // Error and loading states
  error: {
    color: '#ef4444',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    padding: '0.75rem',
    margin: '1rem 0',
    fontSize: '0.875rem'
  },
  loading: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280',
    fontSize: '1.125rem'
  },
  
  // Empty states
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    color: '#6b7280'
  },
  emptyIcon: {
    fontSize: '4rem',
    marginBottom: '1rem'
  },
  
  // Quiz list
  quizListPage: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem',
    textAlign: 'center'
  },
  quizGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem',
    marginTop: '2rem'
  },
  quizCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  quizCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  quizTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0,
    flex: 1
  },
  quizBadge: {
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.375rem',
    whiteSpace: 'nowrap'
  },
  quizDescription: {
    color: '#6b7280',
    marginBottom: '1rem',
    lineHeight: '1.5'
  },
  quizMeta: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  quizActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  
  // Quiz attempt
  quizAttemptPage: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  quizHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '1rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  quizAttemptTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#1f2937',
    margin: 0
  },
  timer: {
    fontSize: '1.25rem',
    fontWeight: '600',
    fontFamily: 'monospace'
  },
  progressSection: {
    marginBottom: '2rem'
  },
  progressText: {
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  },
  progressBar: {
    width: '100%',
    height: '0.5rem',
    backgroundColor: '#e5e7eb',
    borderRadius: '0.25rem',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    transition: 'width 0.3s ease',
    borderRadius: '0.25rem'
  },
  questionCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  },
  questionText: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1.5rem',
    lineHeight: '1.5'
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  optionLabel: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: '#f9fafb'
  },
  radioInput: {
    marginRight: '1rem',
    transform: 'scale(1.2)'
  },
  optionText: {
    fontSize: '1rem',
    color: '#374151'
  },
  navigationButtons: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem'
  },
  
  // User panel
  userPanel: {
    maxWidth: '800px',
    margin: '0 auto'
  },
  panelTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: '2rem'
  },
  tabNav: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '1rem'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '500',
    color: '#6b7280',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  activeTab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  
  // Score cards
  scoreCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '1rem',
    border: '1px solid #e5e7eb'
  },
  scoreTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '1rem'
  },
  scoreStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    marginBottom: '1rem'
  },
  scoreStat: {
    textAlign: 'center'
  },
  scoreLabel: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#6b7280',
    textTransform: 'uppercase',
    fontWeight: '500',
    marginBottom: '0.25rem'
  },
  scoreValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1f2937'
  },
  scoreDate: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'right'
  },
  
  // Admin panel
  adminPanel: {
    maxWidth: '1000px',
    margin: '0 auto'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    marginBottom: '2rem'
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  },
  statNumber: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#3b82f6',
    marginBottom: '0.5rem'
  },
  statLabel: {
    color: '#6b7280',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    fontWeight: '500'
  },
  adminQuizCard: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
  },
  adminActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginTop: '1rem'
  },
  
  // Modal
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem'
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '1rem',
    width: '100%',
    maxWidth: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb'
  },
  formContainer: {
    padding: '1.5rem'
  },
  formActions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb'
  },
  questionForm: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f9fafb'
  },
  optionForm: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.5rem'
  },
  
  // Leaderboard
  leaderboard: {
    padding: '1rem'
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  rank: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#3b82f6',
    width: '3rem',
    textAlign: 'center'
  },
  playerInfo: {
    flex: 1,
    marginLeft: '1rem'
  },
  playerName: {
    fontWeight: '600',
    color: '#1f2937'
  },
  playerStats: {
    fontSize: '0.875rem',
    color: '#6b7280'
  },
  playerScore: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#059669'
  },
  
  // Results table
  resultsTable: {
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    overflow: 'hidden'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s'
  },
  
  // Footer
  footer: {
    backgroundColor: '#1f2937',
    color: '#d1d5db',
    textAlign: 'center',
    padding: '2rem',
    marginTop: '3rem'
  },
  
  // Authentication toggle
  toggleAuth: {
    textAlign: 'center',
    marginTop: '1.5rem',
    color: '#6b7280'
  },
  toggleLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '500'
  }
};








