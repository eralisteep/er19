"use client";

import { useState, useEffect } from "react";
import { Form, Row } from "react-bootstrap";
import { Anvil, Blocks, Check, Gift, Pencil, Plus, Rotate3D, Trash2, Volume2, VolumeX, X } from "lucide-react";
import { db, auth } from "../firebase.config";
import { collection, query, onSnapshot } from "firebase/firestore";
import axios from "axios";
import createUser from "../controllers/add_user";
import deleteUser from "../controllers/delete_user";
import updateUser from "../controllers/update_user.js";
import { useTheme } from "next-themes";
import ThemeToggle from "@/components/ThemeToggle";
import Register from "@/components/Register";
import Login from "@/components/Login";
import Logout from "@/components/Logout";
import { onAuthStateChanged } from "firebase/auth";
import { checkRole } from "@/components/CheckRole";
import { checkCreater } from "@/components/CheckCreater";
import UploadFile from "@/components/UploadFile";

const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TG_BOT_KEY;
const TELEGRAM_CHAT_ID = "-4706850495";

export default function Home() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [last, setLast] = useState("");
  const [file, setFile] = useState(null);
  const [editUserId, setEditUserId] = useState(null);
  const [isAimEnabled, setIsAimEnabled] = useState(false); 
  const [isSoundEnabled, setIsSoundEnabled] = useState(false); 
  const [animation, setAnimation] = useState("");
  const { theme, setTheme } = useTheme();
  const [isCreater,setIsCreater] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [createrEmails, setCreaterEmails] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      const adminStatus = await checkRole("admin");
      setIsAdmin(adminStatus);
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    const savedAimState = localStorage.getItem("aimEnabled") === "true";
    const savedSoundState = localStorage.getItem("soundEnabled") === "true";
    setIsAimEnabled(savedAimState);
    setIsSoundEnabled(savedSoundState);
  }, []);

  useEffect(() => {
    const usersCollection = collection(db, "informations");
    const q = query(usersCollection);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCreators = async () => {
      const newCreaterEmails = {};
      for (const u of users) {
        newCreaterEmails[u.id] = await checkCreater(u.creater);
      }
      setCreaterEmails(newCreaterEmails);
    };

    if (users.length > 0) {
      fetchCreators();
    }
  }, [users]);

  useEffect(() => {
    if (!isAimEnabled) return; 

    const cursor = document.querySelector(".cursor");
    const shootSound = new Audio("/1323308625854201938.ogg");

    if (!cursor) {
      console.error("❌ Ошибка: .cursor не найден!");
      return;
    }

    
    const moveCursor = (e) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    
    const shoot = () => {
      cursor.classList.add("shooting");

      if (isSoundEnabled) {
        shootSound.currentTime = 0;
        shootSound.play().catch((error) => console.error("Ошибка воспроизведения:", error));
      }

      setTimeout(() => {
        cursor.classList.remove("shooting");
      }, 150);
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("click", shoot);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("click", shoot);
    };
  }, [isAimEnabled, isSoundEnabled]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  
  const toggleAim = () => {
    setIsAimEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem("aimEnabled", newState);
      return newState;
    });
  };

  
  const toggleSound = () => {
    setIsSoundEnabled((prev) => {
      const newState = !prev;
      localStorage.setItem("soundEnabled", newState);
      return newState;
    });
  };

  const handleSubmit = async () => {
    let fileURL = "";
    if (file) {
      const formData = new FormData();
      formData.append("chat_id", TELEGRAM_CHAT_ID);
      formData.append("document", file);
  
      try {
        const response = await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });
        console.log(response.data);
  
        if (response.data && response.data.result && response.data.result.document && response.data.result.document.file_id) {
          fileURL = response.data.result.document.file_id;
        } else {
          console.error("Ошибка: file_id не найден в ответе Telegram API");
          console.log("Ответ от Telegram API:", response.data);
        }
      } catch (error) {
        console.error("Ошибка загрузки файла в Telegram:", error);
      }
    }
  
    const userData = { name, age, last, fileURL };
  
    if (editUserId) {
      updateUser(editUserId, userData);
      setEditUserId(null);
    } else {
      try {
        await createUser(name, age, last, fileURL);
      } catch (error) {
        console.error("Ошибка создания пользователя:", error);
      }
    }
    setName("");
    setAge("");
    setLast("");
    setFile(null);
  };

  const handleAnimation = () => {
    if (animation === "") {
      setAnimation("spin");
    } else {
      setAnimation("");}
  }
  const handleEdit = (user) => {
    setName(user.name);
    setAge(user.age);
    setLast(user.last);
    setFile(user.fileURL);
    setEditUserId(user.id);
  };

  const handleCancel = () => {
    setName("");
    setAge("");
    setLast("");
    setFile("");
    setEditUserId(null);
  };

  return (
    <div className={`container ${animation}`}>
      {isAimEnabled && <img src="/image.png" className="cursor" />}
      <ThemeToggle/>
      <Rotate3D onClick={handleAnimation} style={{ marginLeft: "10px" }}>
        Анимация
      </Rotate3D>
      <div style={{ marginBottom: "20px" }}>
        <Anvil onClick={toggleAim}>
          {isAimEnabled ? "Выключить прицел" : "Включить прицел"}
        </Anvil>
        {isSoundEnabled ? (
          <Volume2 onClick={toggleSound} style={{ marginLeft: "10px" }}>
            Выключить звук
          </Volume2>
        ) : (
          <VolumeX onClick={toggleSound} style={{ marginLeft: "10px" }}>
            Включить звук
          </VolumeX>
        )}
      </div>

      {user ? (
        <>
          <Logout />
          <Form id="form">
            <Form.Group>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="text"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Age"
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="text"
                value={last}
                onChange={(e) => setLast(e.target.value)}
                placeholder="Last"
              />
            </Form.Group>
            <Form.Group>
              <Form.Control
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
              />
              максимальный размер файла 50 МБ
            </Form.Group>
            <Plus onClick={handleSubmit}>Submit</Plus>
            {editUserId && <X onClick={handleCancel}>Cancel editing</X>}
          </Form>

          <h1>informations</h1>
          {users.length > 0 ? (
            users.map((user, index) => (
              <Row key={index}>
                <h2>{user.name}</h2>
                <h2>{user.age}</h2>
                <h2>{user.last}</h2>
                {user.fileURL && <UploadFile fileId={user.fileURL} />}
                {isAdmin || createrEmails[user.id] ? (
                  <>
                    <Trash2 onClick={() => deleteUser(user.id)}>Delete</Trash2>
                    <Pencil onClick={() => {
                      handleEdit(user);
                      document.getElementById("form")?.scrollIntoView({ behavior: "smooth" });
                    }} />
                  </>
                ) : null}
              </Row>
            ))
          ) : (
            <p>Loading</p>
          )}
        </>
      ) : (
        <>
          <Register />
          <Login />
        </>
      )}
      <a id="minecraft-d" href="TLauncher-Installer-1.6.8.exe" download>
        <Blocks></Blocks>
      </a>
      <a id="minecraft-p" href="https://tlauncher.org/apk" download>
        <Blocks></Blocks>
      </a>
      <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
        <Gift></Gift>
      </a>
    </div>
  );
}