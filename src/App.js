import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import RegistrationPage from './components/RegistrationPage';
import './App.css';
import { useAuth } from './components/useAuth';
import ListingForm from './components/ListingForm';
import MessageForm from './components/MessageForm';
import LoginForm from './components/Login';
import ProfilePage from './components/ProfilePage';

const COHORT_NAME = '2302-ACC-PT-WEB-PT-D';
  const BASE_URL = `https://strangers-things.herokuapp.com/api/${COHORT_NAME}`;

const handleDeletePost = async (postId, token, setData) => {
  
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${BASE_URL}/posts/${postId}`, {
      method: 'DELETE',
      headers: headers,
    });

    if (response.ok) {
      setData((prevData) => prevData.filter((post) => post._id !== postId));
    } else {
      console.error('Failed to delete post:', response.statusText);
    }
  } catch (error) {
    console.error('API request error:', error);
  }
};
function App() {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState (null);
  const [user, setUser] = useState(null); 


  useEffect(() => {
    const authToken = sessionStorage.getItem('authToken');
    if (authToken) {
      setToken(authToken);
      setIsLoggedIn(true);

      const fetchUser = async () => {
        try {
          const headers = {
            'Authorization': `Bearer ${authToken}`,
          };

          const response = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            headers: headers,
          });

          if (response.ok) {
            const result = await response.json();
            setUser(result.data.user);
          } else {
            console.error('Failed to fetch user data:', response.statusText);
          }
        } catch (error) {
          console.error('API request error:', error);
        }
      };

      fetchUser();
    }
  }, []); 

  const handleAddListing = (newListing) => {
    setData((prevData) => [newListing, ...prevData]);
  };
  
    const createListing = async (newListing) => {
      try {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
  
        const response = await fetch(`${BASE_URL}/posts`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ post: newListing })
        });
  
        if (response.ok) {
          const result = await response.json();
          console.log('New listing created:', result);

        } else {
          console.error('Failed to create listing:', response.statusText);
         
        }
      } catch (error) {
        console.error('API request error:', error);
        
      }
    };

  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BASE_URL}/posts`);
        if (response.ok) {
          const result = await response.json();
          setData(result.data.posts);
        } else {
          console.error('Failed to fetch data:', response.status, response.statusText);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchPosts();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: {
            username,
            password,
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const token = result.token;

        setIsLoggedIn(true);

        sessionStorage.setItem('authToken', token);
      } else {
        console.error('Authentication failed:', response.statusText);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };


  return (
    <div>
      <Router>
      <Navbar />
        {isLoggedIn && <ListingForm onAddListing={handleAddListing} />}
        
        <div>
          {isLoggedIn ? (
            <p>You are logged in.</p>
          ) : (
      <LoginForm/>
)};
        </div>

        <Routes>
        <Route path="/" element={<Home data={data} isLoggedIn={isLoggedIn} />} />
        <Route path="/signup" element={<RegistrationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        </Routes>

      </Router>
    </div>
  );
}

function Home({ data, isLoggedIn }) {
  return (
    <div>
      <div className="card-container">
        {data.map((post) => (
          <div key={post._id} className="card">
            <h2>{post.title}</h2>
            <p>{post.description}</p>
            {isLoggedIn && !post.isAuthor && (
              <MessageForm postId={post._id} postAuthor={post.author.username} />
            )}
            {post.isAuthor && (
              // Render the delete button only if the user is the author of the post
              <button onClick={() => handleDeletePost(post._id)}>Delete</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


export default App;
