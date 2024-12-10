import React from 'react'
import './CSS/Home.css';
import Navbar from '../Components/Navbar/Navbar';


const Home = () => {
  return (
    <div className='home'>
        <Navbar />

        <header className="header">
        <h1>Welcome to CodeSphere</h1>
        <p>Enable real-time code sharing and collaboration in multiple languages.</p>
        <button className="cta-button">Get Started</button>
      </header>

      {/* Features Section */}
      <section className="features">
        <h2>Our Key Features</h2>
        <div className="feature-list">
          <div className="feature">
            <h3>Real-Time Collaboration</h3>
            <p>Work with your team in real-time, with synchronized code sharing and collaboration.</p>
          </div>
          <div className="feature">
            <h3>Multiple Language Support</h3>
            <p>C/C++, Python, Java, JavaScript. More languages coming soon!</p>
          </div>
          <div className="feature">
            <h3>Code Editing Tools</h3>
            <p>Syntax highlighting, code completion, and debugging tools.</p>
          </div>
          <div className="feature">
            <h3>Compilation & Execution</h3>
            <p>Compile and run your code directly from the platform.</p>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footers">
        <p>© 2024 CodeSphere. All rights reserved.</p>
        <p>Contact us: Tusharkumargupta1111@gmail.com</p>
      </footer>

    </div>
  )
}

export default Home