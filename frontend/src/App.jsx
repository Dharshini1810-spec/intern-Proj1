import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiCompass, FiBookOpen, FiAlertTriangle, FiChevronRight, 
  FiRefreshCw, FiPlus, FiAward, FiHeart, FiCpu, FiStar, FiActivity, FiMapPin, FiBriefcase
} from 'react-icons/fi';
import { FaSkull, FaCrown, FaUserAstronaut, FaMagic, FaVolumeUp } from 'react-icons/fa';
import { storyService } from './services/storyService';

// Kids Character Presets
const CHARACTERS = [
  { id: 'Luna', name: 'Princess Luna', icon: '👑', avatar: FaCrown, desc: ' Luna commands animal speech and wears a tiara of starlight!', ability: 'Animal Talk', personality: 'Kind & Friendly', color: 'from-pink-400 to-rose-500' },
  { id: 'Alex', name: 'Astronaut Alex', icon: '🚀', avatar: FaUserAstronaut, desc: 'Alex uses special gravity boots to float in space!', ability: 'Gravity Float', personality: 'Curious & Brave', color: 'from-cyan-400 to-blue-500' },
  { id: 'Penny', name: 'Pirate Penny', icon: '🏴‍☠️', avatar: FiCompass, desc: 'Penny navigates stormy seas with a golden spyglass!', ability: 'Spyglass Sight', personality: 'Daring & Adventurous', color: 'from-amber-400 to-orange-500' },
  { id: 'Wally', name: 'Wizard Wally', icon: '🧙‍♂️', avatar: FaMagic, desc: 'Wally wields a magic wand that lights up dark caves!', ability: 'Sparkle Spell', personality: 'Wise & Gentle', color: 'from-purple-400 to-indigo-500' },
  { id: 'Rex', name: 'Robot Rex', icon: '🤖', avatar: FiCpu, desc: 'Rex is made of shiny iron and uses a super-scanner tool!', ability: 'Super Scanner', personality: 'Funny & Smart', color: 'from-emerald-400 to-teal-500' },
  { id: 'Dave', name: 'Dino Dave', icon: '🦖', avatar: FiActivity, desc: 'Dave stomps through wild jungles with strong dinosaur footprints!', ability: 'Dino Roar', personality: 'Strong & Playful', color: 'from-lime-400 to-green-600' },
  { id: 'Emma', name: 'Explorer Emma', icon: '🧭', avatar: FiCompass, desc: 'Emma uses her trusty compass to locate hidden paths!', ability: 'Path Finder', personality: 'Clever & Quick', color: 'from-orange-400 to-red-500' },
];

const PRESET_THEMES = [
  { theme: 'Magic Kingdom', icon: '🏰', desc: 'Dragons, friendly wizards, and starlight spells.' },
  { theme: 'Ocean Adventure', icon: '🏴‍☠️', desc: 'Sunken ships, talking dolphins, and chest maps.' },
  { theme: 'Space Exploration', icon: '🚀', desc: 'Rocket travel, friendly aliens, and zero-gravity.' },
  { theme: 'Dino Jungle', icon: '🌴', desc: 'Baby dinosaurs, giant waterfalls, and ancient relics.' },
];

// Map Locations
const MAP_LOCATIONS = [
  { name: 'Enchanted Forest', icon: '🌲', color: '#2bd980' },
  { name: 'Crystal Cave', icon: '💎', color: '#33d9ff' },
  { name: 'Wizard Tower', icon: '🧙‍♂️', color: '#8b5cf6' },
  { name: 'Dragon Mountain', icon: '🏔', color: '#ffb633' },
  { name: 'Pirate Island', icon: '🏴‍☠️', color: '#f59e0b' },
  { name: 'Space Station', icon: '🚀', color: '#06b6d4' },
  { name: 'Magic Castle', icon: '🏰', color: '#ff5e97' },
];

const CHARACTER_DIALOGS = {
  Luna: {
    start: "Greetings! I am Princess Luna. I'm thrilled to guide you on this starlight quest! Let's spread kindness!",
    generating: "Weaving a story from the stars...",
    play: "I sense a gentle creature nearby. Let's make a kind decision!",
    item: "Look, a magical item! Let's keep it safe!",
    game: "A starry challenge lies ahead! Let's solve it together!",
    ending: "Incredible! We finished our quest. Your kindness is a shining beacon!"
  },
  Alex: {
    start: "Ground control to explorer! Astronaut Alex here. Prepare for launch into adventure!",
    generating: "Mapping the coordinates of the adventure planet...",
    play: "Gravity is low here, let's leap forward and explore!",
    item: "Wow! A space artifact! Added to our mission inventory!",
    game: "Incoming asteroid puzzle! Engage scanner and solve!",
    ending: "Mission accomplished! You are a legendary space hero!"
  },
  Penny: {
    start: "Ahoy, matey! Pirate Penny here. Let's set sail for hidden treasure and daring deeds!",
    generating: "Drawing the treasure map coordinates...",
    play: "Keep a weather eye open, matey! Adventure awaits around the bend!",
    item: "Shiver me timbers! That's a fine piece of loot!",
    game: "A pirate puzzle! Solve it to win the chest!",
    ending: "We found the motherlode! A grand victory ending!"
  },
  Wally: {
    start: "Hello, seeker. I am Wizard Wally. Let's explore the magical arts and solve hidden mysteries!",
    generating: "Conjuring the scrolls of wisdom...",
    play: "Caves can be dark, but our curiosity will light the way!",
    item: "Ah, a powerful magic relic! It hums with spell energy!",
    game: "A magical riddle board! Let's align our thoughts!",
    ending: "Magnificent! We have unlocked the ultimate spell ending!"
  },
  Rex: {
    start: "BEEP-BOOP! Robot Rex online. Initializing adventure subroutines. Let's calculate the fun!",
    generating: "Processing path algorithms...",
    play: "My sensors detect high levels of excitement ahead!",
    item: "Object acquired! Storing in memory bank!",
    game: "Mini-game detected. Initializing logical solve sequences!",
    ending: "Quest successfully computed. Systems running at 100% happiness!"
  },
  Dave: {
    start: "ROAR! Dino Dave here! Let's stomp into the wild jungle and find huge surprises!",
    generating: "Stomping through the ancient timelines...",
    play: "Watch out for sleeping dinosaurs! Step carefully!",
    item: "Roar! A giant jungle treasure!",
    game: "A prehistoric match! Let's crush this puzzle!",
    ending: "Fossil-tastic! We made it to the prehistoric victory ending!"
  },
  Emma: {
    start: "Hi! Explorer Emma here. Ready to map out the uncharted trails? Let's go!",
    generating: "Analyzing path options...",
    play: "My compass is spinning! There must be something hidden nearby!",
    item: "Great find! That fits perfectly in my explorer pack!",
    game: "A path block! Let's solve the connection!",
    ending: "We've mapped the entire realm! A perfect ending!"
  }
};

export default function App() {
  const [step, setStep] = useState('character-selection'); // character-selection, landing, generating, playing, ending
  const [selectedChar, setSelectedChar] = useState(CHARACTERS[0]);
  const [themeInput, setThemeInput] = useState('');
  const [loadingMsg, setLoadingMsg] = useState('Conjuring adventure map...');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [story, setStory] = useState(null);
  const [currentNode, setCurrentNode] = useState(null);
  
  // Game states
  const [rewards, setRewards] = useState({ kindness: 10, wisdom: 10, courage: 10, friendship: 10 });
  const [inventory, setInventory] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  
  // Companion guide reaction dialog
  const [guideSpeech, setGuideSpeech] = useState("");

  // Canvas interactive variables
  const canvasRef = useRef(null);
  const rotationRef = useRef({ x: 0.5, y: 0.5 });
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const [selectedShape, setSelectedShape] = useState('Crystal'); // Crystal, Chest, Planet, Portal
  const particlesRef = useRef([]);

  // Mini game state
  const [activeMiniGame, setActiveMiniGame] = useState(null); // memory, bubbles, stars, crystals
  const [miniGameSolved, setMiniGameSolved] = useState(false);
  
  // Confetti particles for achievements and endings
  const [confetti, setConfetti] = useState([]);

  // Star connection game variables
  const [starPath, setStarPath] = useState([]);
  // Memory puzzle variables
  const [memoryCards, setMemoryCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  // Bubble catcher variables
  const [bubbles, setBubbles] = useState([]);
  const [bubblesCaught, setBubblesCaught] = useState(0);
  // Crystal solver variables
  const [crystalGrid, setCrystalGrid] = useState([]);

  // Generate guide bubble
  useEffect(() => {
    const dialogs = CHARACTER_DIALOGS[selectedChar.id] || CHARACTER_DIALOGS.Emma;
    if (step === 'character-selection') {
      setGuideSpeech("Choose me, and let's explore together!");
    } else if (step === 'landing') {
      setGuideSpeech(dialogs.start);
    } else if (step === 'generating') {
      setGuideSpeech(dialogs.generating);
    } else if (step === 'playing' && currentNode) {
      if (currentNode.mini_game && !miniGameSolved) {
        setGuideSpeech(dialogs.game);
      } else if (currentNode.item_collected) {
        setGuideSpeech(`${dialogs.item} It's the **${currentNode.item_collected}**!`);
      } else {
        setGuideSpeech(dialogs.play);
      }
    } else if (step === 'ending') {
      setGuideSpeech(dialogs.ending);
    }
  }, [step, currentNode, selectedChar, miniGameSolved]);

  // Click companion for encouragement
  const handleCompanionClick = () => {
    const quotes = [
      "You are doing amazing!",
      "I believe in your choices!",
      "Wow, this is a spectacular quest!",
      "Let's see what happens next!",
      "I'm glad we are adventurers together!"
    ];
    const randQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setGuideSpeech(randQuote);
    triggerCelebrationConfetti();
  };

  // Trigger celebration confetti
  const triggerCelebrationConfetti = () => {
    const newConfetti = Array.from({ length: 40 }).map((_, idx) => ({
      id: idx + Date.now(),
      x: Math.random() * 100,
      y: -10,
      size: Math.random() * 8 + 6,
      color: ['#ff5e97', '#ffb633', '#33d9ff', '#2bd980'][Math.floor(Math.random() * 4)],
      rotation: Math.random() * 360,
      speedY: Math.random() * 4 + 3,
      speedX: Math.random() * 2 - 1
    }));
    setConfetti(prev => [...prev, ...newConfetti]);
  };

  // Animate confetti
  useEffect(() => {
    if (confetti.length > 0) {
      const interval = setInterval(() => {
        setConfetti(prev => 
          prev
            .map(c => ({
              ...c,
              y: c.y + c.speedY,
              x: c.x + c.speedX,
              rotation: c.rotation + 4
            }))
            .filter(c => c.y < 110)
        );
      }, 30);
      return () => clearInterval(interval);
    }
  }, [confetti]);

  // Define 3D Math Vertices/Faces
  const shapesData = {
    Crystal: {
      vertices: [
        { x: 0, y: 1.1, z: 0 },
        { x: 0, y: -1.1, z: 0 },
        { x: 0.7, y: 0, z: 0.7 },
        { x: -0.7, y: 0, z: 0.7 },
        { x: -0.7, y: 0, z: -0.7 },
        { x: 0.7, y: 0, z: -0.7 }
      ],
      faces: [
        [0, 2, 3], [0, 3, 4], [0, 4, 5], [0, 5, 2],
        [1, 3, 2], [1, 4, 3], [1, 5, 4], [1, 2, 5]
      ],
      colorHue: 335
    },
    Chest: {
      vertices: [
        { x: -0.7, y: -0.5, z: -0.5 }, { x: 0.7, y: -0.5, z: -0.5 },
        { x: 0.7, y: 0.3, z: -0.5 }, { x: -0.7, y: 0.3, z: -0.5 },
        { x: -0.7, y: -0.5, z: 0.5 }, { x: 0.7, y: -0.5, z: 0.5 },
        { x: 0.7, y: 0.3, z: 0.5 }, { x: -0.7, y: 0.3, z: 0.5 }
      ],
      faces: [
        [0, 1, 2], [0, 2, 3], // Front
        [4, 6, 5], [4, 7, 6], // Back
        [1, 5, 6], [1, 6, 2], // Right
        [0, 3, 7], [0, 7, 4], // Left
        [3, 2, 6], [3, 6, 7], // Top
        [0, 4, 5], [0, 5, 1]  // Bottom
      ],
      colorHue: 42
    },
    Planet: {
      vertices: [
        { x: 0, y: 0.8, z: 0 }, { x: 0.5, y: 0.5, z: 0.5 },
        { x: -0.5, y: 0.5, z: 0.5 }, { x: -0.5, y: 0.5, z: -0.5 },
        { x: 0.5, y: 0.5, z: -0.5 }, { x: 0.7, y: 0, z: 0.7 },
        { x: -0.7, y: 0, z: 0.7 }, { x: -0.7, y: 0, z: -0.7 },
        { x: 0.7, y: 0, z: -0.7 }, { x: 0, y: -0.8, z: 0 }
      ],
      faces: [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
        [1, 5, 2], [2, 6, 3], [3, 7, 4], [4, 8, 1],
        [2, 5, 6], [3, 6, 7], [4, 7, 8], [1, 8, 5],
        [9, 6, 5], [9, 7, 6], [9, 8, 7], [9, 5, 8]
      ],
      colorHue: 200
    },
    Portal: {
      vertices: [
        { x: 0, y: 0.9, z: 0 }, { x: 0.6, y: 0.4, z: 0.4 },
        { x: -0.6, y: 0.4, z: 0.4 }, { x: -0.6, y: 0.4, z: -0.6 },
        { x: 0.6, y: 0.4, z: -0.6 }, { x: 0.8, y: -0.1, z: 0.5 },
        { x: -0.8, y: -0.1, z: 0.5 }, { x: -0.8, y: -0.1, z: -0.5 },
        { x: 0.8, y: -0.1, z: -0.5 }
      ],
      faces: [
        [0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 1],
        [1, 5, 2], [2, 6, 3], [3, 7, 4], [4, 8, 1],
        [5, 6, 7], [5, 7, 8]
      ],
      colorHue: 280
    }
  };

  // Canvas 3D rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const scale = Math.min(width, height) * 0.32;
      
      if (!isDraggingRef.current) {
        rotationRef.current.y += 0.012;
        rotationRef.current.x = Math.sin(Date.now() * 0.0005) * 0.25 + 0.4;
      }

      const cosX = Math.cos(rotationRef.current.x);
      const sinX = Math.sin(rotationRef.current.x);
      const cosY = Math.cos(rotationRef.current.y);
      const sinY = Math.sin(rotationRef.current.y);

      // Render interactive particles
      const time = Date.now() * 0.0015;
      particlesRef.current.forEach((p, idx) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          particlesRef.current.splice(idx, 1);
          return;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(51, 217, 255, ${p.alpha})`;
        ctx.fill();
      });

      // Spawn periodic ambient sparkles
      if (Math.random() < 0.08) {
        particlesRef.current.push({
          x: width * 0.5 + (Math.random() - 0.5) * 100,
          y: height * 0.5 + (Math.random() - 0.5) * 100,
          size: Math.random() * 3 + 2,
          speedX: (Math.random() - 0.5) * 1,
          speedY: -Math.random() * 1.5,
          alpha: 1
        });
      }

      // Draw Selected 3D Object
      const activeShape = shapesData[selectedShape];
      const rotated = activeShape.vertices.map(v => {
        let x1 = v.x * cosY - v.z * sinY;
        let z1 = v.x * sinY + v.z * cosY;
        let y2 = v.y * cosX - z1 * sinX;
        let z2 = v.y * sinX + z1 * cosX;
        return {
          x: x1 * scale + width * 0.5,
          y: y2 * scale + height * 0.5,
          z: z2
        };
      });

      const facesWithDepth = activeShape.faces.map((face, index) => {
        const zAvg = (rotated[face[0]].z + rotated[face[1]].z + rotated[face[2]].z) / 3;
        return { face, zAvg, index };
      });
      facesWithDepth.sort((a, b) => b.zAvg - a.zAvg);

      facesWithDepth.forEach(({ face, index }) => {
        ctx.beginPath();
        ctx.moveTo(rotated[face[0]].x, rotated[face[0]].y);
        ctx.lineTo(rotated[face[1]].x, rotated[face[1]].y);
        ctx.lineTo(rotated[face[2]].x, rotated[face[2]].y);
        ctx.closePath();

        const hue = activeShape.colorHue;
        const light = 50 + Math.round(rotated[face[0]].z * 18);
        ctx.fillStyle = `hsla(${hue}, 90%, ${light}%, 0.8)`;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.fill();
        ctx.stroke();
      });

      // Draw vertex nodes
      rotated.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [step, selectedShape]);

  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;
    rotationRef.current.y += deltaX * 0.008;
    rotationRef.current.x += deltaY * 0.008;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };

    // Emit physics drag particles
    if (Math.random() < 0.4) {
      const rect = canvasRef.current.getBoundingClientRect();
      particlesRef.current.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        size: Math.random() * 5 + 3,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        alpha: 1
      });
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Dynamic progress loading text
  useEffect(() => {
    if (step === 'generating') {
      const messages = [
        'Conjuring the forest trails...',
        'Spawning magic doors and golems...',
        'Injecting mini-game challenges...',
        'Setting the 14 mythical endings...',
        'Spawning your guide companion...'
      ];
      let msgIdx = 0;
      const interval = setInterval(() => {
        if (msgIdx < messages.length - 1) {
          msgIdx++;
          setLoadingMsg(messages[msgIdx]);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleGenerateStory = async (selectedTheme) => {
    const finalTheme = selectedTheme || themeInput.trim();
    if (!finalTheme) return;

    setStep('generating');
    setError(null);
    setLoadingMsg('Spinning the globe...');

    // Clear previous game states
    setRewards({ kindness: 10, wisdom: 10, courage: 10, friendship: 10 });
    setInventory([]);
    setAchievements([]);
    setMiniGameSolved(false);

    try {
      const jobData = await storyService.createStory(finalTheme, selectedChar.name);
      setJobId(jobData.job_id);
      setJobStatus(jobData.status);
      pollJob(jobData.job_id);
    } catch (err) {
      console.error(err);
      setError('Magical barrier detected! Failed to connect to server.');
      setStep('landing');
    }
  };

  const pollJob = (id) => {
    const pollInterval = setInterval(async () => {
      try {
        const jobData = await storyService.getJobStatus(id);
        setJobStatus(jobData.status);

        if (jobData.status === 'completed') {
          clearInterval(pollInterval);
          setLoadingMsg('Adventure portal open! Step inside!');
          fetchStory(jobData.story_id);
        } else if (jobData.status === 'failed') {
          clearInterval(pollInterval);
          setError(jobData.error || 'Generation failed.');
          setStep('landing');
        }
      } catch (err) {
        console.error(err);
        clearInterval(pollInterval);
        setError('Lost path tracking connection.');
        setStep('landing');
      }
    }, 2000);
  };

  const fetchStory = async (storyId) => {
    try {
      const storyData = await storyService.getStory(storyId);
      setStory(storyData);
      setCurrentNode(storyData.root_node);
      setHistory([]);
      applyNodeEffects(storyData.root_node);
      setStep('playing');
    } catch (err) {
      console.error(err);
      setError('Could not retrieve story tree.');
      setStep('landing');
    }
  };

  const applyNodeEffects = (node) => {
    if (!node) return;

    // Apply rewards points addition
    if (node.rewards) {
      setRewards(prev => {
        const updated = { ...prev };
        Object.entries(node.rewards).forEach(([key, val]) => {
          if (updated.hasOwnProperty(key)) {
            updated[key] = Math.min(100, updated[key] + val);
          }
        });
        return updated;
      });
      triggerCelebrationConfetti();
    }

    // Add item to inventory
    if (node.item_collected && !inventory.includes(node.item_collected)) {
      setInventory(prev => [...prev, node.item_collected]);
      triggerCelebrationConfetti();
    }

    // Unlock achievement
    if (node.achievement_unlocked && !achievements.includes(node.achievement_unlocked)) {
      setAchievements(prev => [...prev, node.achievement_unlocked]);
      triggerCelebrationConfetti();
    }

    // Start mini-game if node has one
    if (node.mini_game) {
      setMiniGameSolved(false);
      startMiniGame(node.mini_game);
    }
  };

  const handleChooseOption = (option) => {
    if (!story || !story.all_nodes) return;
    
    // Check if the path is locked by inventory
    if (option.required_item && !inventory.includes(option.required_item)) {
      setGuideSpeech(`Oh! We need the **${option.required_item}** from our inventory to take this path! Let's choose the other direction!`);
      return;
    }

    const nextNodeId = option.node_id;
    const nextNode = story.all_nodes[String(nextNodeId)];

    if (nextNode) {
      setHistory([...history, { 
        nodeId: currentNode.id, 
        optionText: option.text,
        content: currentNode.content,
        chapter: currentNode.chapter,
        item: currentNode.item_collected,
        achievement: currentNode.achievement_unlocked
      }]);
      
      setCurrentNode(nextNode);
      applyNodeEffects(nextNode);

      if (nextNode.is_ending) {
        setStep('ending');
        triggerCelebrationConfetti();
      }
    }
  };

  const navigateBackToNode = (index) => {
    if (index === -1) {
      setCurrentNode(story.root_node);
      setHistory([]);
      setRewards({ kindness: 10, wisdom: 10, courage: 10, friendship: 10 });
      setInventory([]);
      setAchievements([]);
      setStep('playing');
    } else {
      const histItem = history[index];
      const targetNode = story.all_nodes[String(histItem.nodeId)];
      if (targetNode) {
        setCurrentNode(targetNode);
        
        const newHistory = history.slice(0, index);
        setHistory(newHistory);
        
        const newInv = [];
        const newAch = [];
        const newRew = { kindness: 10, wisdom: 10, courage: 10, friendship: 10 };
        
        if (story.root_node.item_collected) newInv.push(story.root_node.item_collected);
        if (story.root_node.achievement_unlocked) newAch.push(story.root_node.achievement_unlocked);
        if (story.root_node.rewards) {
          Object.entries(story.root_node.rewards).forEach(([k, v]) => { newRew[k] += v; });
        }
        
        newHistory.forEach(h => {
          const n = story.all_nodes[String(h.nodeId)];
          if (n.item_collected && !newInv.includes(n.item_collected)) newInv.push(n.item_collected);
          if (n.achievement_unlocked && !newAch.includes(n.achievement_unlocked)) newAch.push(n.achievement_unlocked);
          if (n.rewards) {
            Object.entries(n.rewards).forEach(([k, v]) => { newRew[k] = Math.min(100, newRew[k] + v); });
          }
        });

        setInventory(newInv);
        setAchievements(newAch);
        setRewards(newRew);
        setStep('playing');
      }
    }
  };

  const handleRestartStory = () => {
    if (story) {
      setCurrentNode(story.root_node);
      setHistory([]);
      setRewards({ kindness: 10, wisdom: 10, courage: 10, friendship: 10 });
      setInventory([]);
      setAchievements([]);
      setStep('playing');
      setMiniGameSolved(false);
    }
  };

  const handleCreateNew = () => {
    setStory(null);
    setCurrentNode(null);
    setHistory([]);
    setThemeInput('');
    setStep('character-selection');
    setMiniGameSolved(false);
  };

  // MINI GAMES LAUNCH LOGIC
  const startMiniGame = (type) => {
    setActiveMiniGame(type);
    if (type === 'stars') {
      setStarPath([]);
    } else if (type === 'memory') {
      const cards = ['🔑', '💎', '🧪', '🔑', '💎', '🧪'].sort(() => Math.random() - 0.5);
      setMemoryCards(cards.map((c, idx) => ({ id: idx, val: c, isFlipped: false, isMatched: false })));
      setFlippedCards([]);
      setMatchedPairs([]);
    } else if (type === 'bubbles') {
      const initialBubbles = Array.from({ length: 6 }).map((_, idx) => ({
        id: idx,
        x: Math.random() * 80 + 10,
        y: Math.random() * 70 + 15,
        size: Math.random() * 20 + 35
      }));
      setBubbles(initialBubbles);
      setBubblesCaught(0);
    } else if (type === 'crystals') {
      const colors = ['#ff5e97', '#ffb633', '#33d9ff'];
      const initialGrid = Array.from({ length: 9 }).map((_, idx) => ({
        id: idx,
        color: colors[idx % 3]
      }));
      setCrystalGrid(initialGrid);
    }
  };

  const solveMiniGame = () => {
    setMiniGameSolved(true);
    setActiveMiniGame(null);
    triggerCelebrationConfetti();
    setRewards(prev => ({
      ...prev,
      wisdom: Math.min(100, prev.wisdom + 15),
      courage: Math.min(100, prev.courage + 15)
    }));
    setGuideSpeech("Splendid! We solved the mini-game puzzle! Let's continue our journey!");
  };

  // Memory match logic
  const handleCardClick = (card) => {
    if (flippedCards.length === 2 || card.isFlipped || card.isMatched) return;
    
    const updatedCards = memoryCards.map(c => c.id === card.id ? { ...c, isFlipped: true } : c);
    setMemoryCards(updatedCards);

    const newFlipped = [...flippedCards, card];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      if (newFlipped[0].val === newFlipped[1].val) {
        setMatchedPairs([...matchedPairs, newFlipped[0].val]);
        setFlippedCards([]);
        const matchedCards = updatedCards.map(c => c.val === card.val ? { ...c, isMatched: true } : c);
        setMemoryCards(matchedCards);
        
        if (matchedPairs.length + 1 === 3) {
          setTimeout(() => solveMiniGame(), 800);
        }
      } else {
        setTimeout(() => {
          const resetCards = updatedCards.map(c => 
            c.id === newFlipped[0].id || c.id === newFlipped[1].id ? { ...c, isFlipped: false } : c
          );
          setMemoryCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Bubble pop logic
  const handleBubblePop = (id) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setBubblesCaught(prev => {
      const updated = prev + 1;
      if (updated >= 6) {
        setTimeout(() => solveMiniGame(), 500);
      }
      return updated;
    });
  };

  // Star connection click logic
  const handleStarClick = (starNum) => {
    if (starPath.includes(starNum)) return;
    if (starNum === starPath.length + 1) {
      const newPath = [...starPath, starNum];
      setStarPath(newPath);
      if (newPath.length === 4) {
        setTimeout(() => solveMiniGame(), 800);
      }
    }
  };

  // Crystal grid change logic
  const handleGridClick = (idx) => {
    const colors = ['#ff5e97', '#ffb633', '#33d9ff'];
    const updated = crystalGrid.map((c, i) => {
      if (i === idx) {
        const nextColorIdx = (colors.indexOf(c.color) + 1) % colors.length;
        return { ...c, color: colors[nextColorIdx] };
      }
      return c;
    });
    setCrystalGrid(updated);

    // Check match all grid colors
    const targetColor = updated[0].color;
    if (updated.every(c => c.color === targetColor)) {
      setTimeout(() => solveMiniGame(), 800);
    }
  };

  // Dynamic Background resolver based on story/chapter progress
  const getDynamicBackgroundClass = () => {
    if (!currentNode) return 'bg-[#0d0c22]';
    const content = currentNode.content.toLowerCase();
    if (content.includes('space') || content.includes('astronaut')) {
      return 'bg-gradient-to-br from-[#0c1020] via-[#091535] to-[#12072b]';
    }
    if (content.includes('forest') || content.includes('elf')) {
      return 'bg-gradient-to-br from-[#0a1e1b] via-[#092922] to-[#151c14]';
    }
    if (content.includes('cavern') || content.includes('crystal') || content.includes('ruby')) {
      return 'bg-gradient-to-br from-[#120f26] via-[#1c0d29] to-[#0a071c]';
    }
    if (content.includes('castle') || content.includes('bridge') || content.includes('golem')) {
      return 'bg-gradient-to-br from-[#1b0d22] via-[#2d112d] to-[#120520]';
    }
    return 'bg-gradient-to-br from-[#0d0c22] via-[#141235] to-[#0c081e]';
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-4 md:p-6 transition-all duration-700 relative overflow-hidden ${getDynamicBackgroundClass()}`}>
      
      {/* Dynamic star particles floating background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="stars-glowing absolute h-full w-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/10 via-transparent to-transparent animate-pulse"></div>
      </div>

      {/* Confetti Render Canvas */}
      {confetti.map(c => (
        <div 
          key={c.id} 
          className="absolute z-50 rounded-full"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            transform: `rotate(${c.rotation}deg)`,
            boxShadow: `0 0 6px ${c.color}`,
            transition: 'top 0.03s linear, left 0.03s linear'
          }}
        />
      ))}

      {/* HEADER */}
      <header className="w-full max-w-6xl flex items-center justify-between mb-4 bg-slate-950/45 p-4 rounded-3xl border border-slate-800/80 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <FiCompass className="h-6 w-6 text-white animate-spin [animation-duration:15s]" />
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            DestinyPath <span className="text-secondary text-base">KIDS</span>
          </span>
        </div>

        {step !== 'character-selection' && step !== 'generating' && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowJournal(!showJournal)}
              className="px-4 py-2 rounded-2xl bg-slate-900 border border-slate-850 text-slate-200 font-bold hover:bg-slate-850 text-xs transition-all flex items-center gap-2"
            >
              <FiBookOpen className="h-4 w-4" />
              <span>Journal ({history.length})</span>
            </button>
            <button 
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold hover:brightness-110 text-xs transition-all flex items-center gap-1.5 shadow-md shadow-red-500/20"
            >
              <FiPlus className="h-4 w-4" />
              <span>New Game</span>
            </button>
          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="w-full max-w-6xl flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">
        
        {/* LEFT COLUMN: COMPANION + 3D SHAPE INSPECTOR + REWARD STATE */}
        {step !== 'character-selection' && step !== 'generating' && (
          <section className="lg:col-span-4 space-y-4">
            
            {/* COMPANION GUIDE HERO CARD (Reactive bubble speaking on every screen) */}
            <div className="kids-panel p-5 border-primary relative flex flex-col gap-3 group">
              <div className="flex items-center gap-4">
                <div className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${selectedChar.color} flex items-center justify-center text-4xl shadow-md border-2 border-white cursor-pointer transform hover:scale-110 active:scale-95 transition-all duration-300`} onClick={handleCompanionClick}>
                  {React.createElement(selectedChar.avatar, { className: "text-white h-8 w-8 animate-bounce [animation-duration:3s]" })}
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Companion Guide</span>
                  <h3 className="text-xl font-bold text-white leading-none">{selectedChar.name}</h3>
                  <span className="text-xs text-secondary font-semibold">Ability: {selectedChar.ability}</span>
                </div>
              </div>

              {/* Talking Animated Speech Bubble */}
              <div className="relative mt-2 p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-200 text-sm leading-relaxed font-bold shadow-inner">
                <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 bg-slate-950 border-l border-t border-slate-800"></div>
                <p>{guideSpeech}</p>
                <div className="flex justify-end mt-1 text-[9px] text-slate-500 italic uppercase">
                  Click avatar to cheer!
                </div>
              </div>
            </div>

            {/* 3D CANVAS SHAPE INSPECTOR */}
            <div className="kids-panel p-4 flex flex-col items-center justify-center gap-3 border-accent">
              <div className="w-full flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                  <FiStar className="text-accent animate-pulse" />
                  <span>3D Relic Inspector</span>
                </h4>
                
                {/* Select Shape Toggles */}
                <div className="flex gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-850">
                  {['Crystal', 'Chest', 'Planet', 'Portal'].map(shape => (
                    <button
                      key={shape}
                      onClick={() => setSelectedShape(shape)}
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                        selectedShape === shape ? 'bg-accent text-slate-950' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div className="perspective-container w-full bg-slate-950/60 rounded-3xl border border-slate-800/80 flex items-center justify-center p-2 relative overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={240}
                  height={240}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="cursor-grab active:cursor-grabbing"
                />
              </div>
            </div>

            {/* ADVENTURE REWARDS POINTS */}
            <div className="kids-panel p-5 space-y-4 border-success">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1">
                <span>❤️</span> <span>Adventure Points</span>
              </h4>
              
              <div className="space-y-3">
                {/* Kindness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-1"><FiHeart className="text-red-400" /> Kindness</span>
                    <span>{rewards.kindness} pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-red-400 to-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${rewards.kindness}%` }}></div>
                  </div>
                </div>

                {/* Wisdom */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-1"><FiBookOpen className="text-blue-400" /> Wisdom</span>
                    <span>{rewards.wisdom} pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-blue-400 to-cyan-500 h-full rounded-full transition-all duration-500" style={{ width: `${rewards.wisdom}%` }}></div>
                  </div>
                </div>

                {/* Courage */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-1"><FiActivity className="text-orange-400" /> Courage</span>
                    <span>{rewards.courage} pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${rewards.courage}%` }}></div>
                  </div>
                </div>

                {/* Friendship */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300 font-bold">
                    <span className="flex items-center gap-1"><FiCompass className="text-purple-400" /> Friendship</span>
                    <span>{rewards.friendship} pts</span>
                  </div>
                  <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-850">
                    <div className="bg-gradient-to-r from-purple-400 to-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${rewards.friendship}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* INVENTORY PANEL */}
            <div className="kids-panel p-4 space-y-2 border-secondary">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                <FiBriefcase className="text-secondary" />
                <span>Adventure Backpack ({inventory.length})</span>
              </h4>
              {inventory.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {inventory.map(item => (
                    <span key={item} className="px-3 py-1.5 bg-slate-950 border border-slate-850 rounded-2xl text-xs font-bold text-secondary shadow-md flex items-center gap-1 border-b-4 border-secondary transform hover:scale-105 active:scale-95 transition-all">
                      <span>✨</span> {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-xs italic font-medium">Search the chapters to gather mystical relics!</p>
              )}
            </div>

          </section>
        )}

        {/* RIGHT COLUMN: CORE GAME SCREEN PORTAL */}
        <section className={`col-span-1 ${step !== 'character-selection' && step !== 'generating' ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          <AnimatePresence mode="wait">
            
            {/* STEP 0: CHARACTER SELECTION SCREEN */}
            {step === 'character-selection' && (
              <motion.div
                key="char-selection"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-6"
              >
                <div className="text-center space-y-2.5">
                  <span className="px-3 py-1 text-xs font-black tracking-wider text-primary bg-primary/10 rounded-full border-2 border-primary/20 uppercase">
                    DestinyPath Kids
                  </span>
                  <h1 className="text-4xl md:text-5xl font-black text-white">Select Your Companion Hero!</h1>
                  <p className="text-slate-300 text-sm max-w-lg mx-auto font-bold">
                     Choose a companion character who will guide you, speak to you, and celebrate wins throughout your story quest!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {CHARACTERS.map((char) => {
                    const isSelected = selectedChar.id === char.id;
                    return (
                      <button
                        key={char.id}
                        onClick={() => setSelectedChar(char)}
                        className={`kids-card p-4 text-center border-4 flex flex-col items-center justify-between gap-3 ${
                          isSelected ? 'border-primary bg-slate-900/60 scale-102 shadow-lg shadow-primary/20' : 'border-slate-800 hover:border-slate-750'
                        }`}
                      >
                        <div className={`h-16 w-16 rounded-2xl bg-gradient-to-tr ${char.color} flex items-center justify-center text-4xl shadow-md border-2 border-white`}>
                          {React.createElement(char.avatar, { className: "text-white h-8 w-8 animate-bounce [animation-duration:3s]" })}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-white">{char.name}</h3>
                          <span className="text-[10px] font-black tracking-wider uppercase text-secondary">
                            {char.ability}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                          {char.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-center mt-2">
                  <button
                    onClick={() => setStep('landing')}
                    className="kids-btn-primary px-12 py-4 font-bold text-lg text-white"
                  >
                    Go Adventure with {selectedChar.name}! ➡️
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 1: LANDING CONFIGURATION */}
            {step === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="w-full flex flex-col gap-6"
              >
                <div className="text-center space-y-3">
                  <button 
                    onClick={() => setStep('character-selection')}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    ⬅️ Select a different Companion
                  </button>
                  <h1 className="text-4xl md:text-5xl font-black text-white">
                    Where shall we explore, {selectedChar.name}?
                  </h1>
                  <p className="text-slate-300 text-sm max-w-lg mx-auto font-bold">
                    Type a custom destination theme below (e.g. Candy Planet, Dinosaur Cave) or pick one of our presets to generate the map.
                  </p>
                </div>

                {error && (
                  <div className="p-4 bg-red-950/30 border-2 border-red-500/30 text-red-400 rounded-2xl flex items-center gap-3 text-sm font-bold">
                    <FiAlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Custom input */}
                <div className="kids-panel p-6 space-y-6 border-primary">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Type Custom Theme
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="e.g. Candy Planet, Magic Forest, Robot City..."
                        value={themeInput}
                        onChange={(e) => setThemeInput(e.target.value)}
                        className="kids-input flex-grow px-4 py-3 text-sm"
                        onKeyDown={(e) => e.key === 'Enter' && handleGenerateStory()}
                      />
                      <button
                        onClick={() => handleGenerateStory()}
                        disabled={!themeInput.trim()}
                        className="kids-btn-primary px-8 py-3 text-sm font-black disabled:opacity-40 disabled:pointer-events-none transition-all duration-150 flex items-center gap-2"
                      >
                        <span>Generate Map</span>
                        <FiChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-slate-800"></div>
                    </div>
                    <span className="relative bg-[#0d0c22] px-3 text-xs font-mono text-slate-500 font-bold">
                      OR SELECT PRESET REALM
                    </span>
                  </div>

                  {/* Preset Themes Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PRESET_THEMES.map((item) => (
                      <button
                        key={item.theme}
                        onClick={() => handleGenerateStory(item.theme)}
                        className="kids-card hover:bg-slate-900/60 p-4 text-left border-3 hover:-translate-y-0.5 active:translate-y-0 flex gap-4 group"
                      >
                        <span className="text-3xl flex-shrink-0 flex items-center justify-center bg-slate-950/40 border border-slate-800/80 rounded-xl h-12 w-12 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all duration-200">
                          {item.icon}
                        </span>
                        <div className="space-y-0.5">
                          <div className="text-sm font-bold text-slate-200 group-hover:text-primary transition-colors">
                            {item.theme}
                          </div>
                          <div className="text-xs text-slate-500 leading-normal line-clamp-2">
                            {item.desc}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: GENERATING SCREEN */}
            {step === 'generating' && (
              <motion.div
                key="generating"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full kids-panel p-8 md:p-12 text-center flex flex-col items-center justify-center gap-6 border-secondary"
              >
                <div className="relative flex items-center justify-center h-24 w-24">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping"></div>
                  <div className="absolute inset-2 rounded-full border-4 border-secondary/15 animate-pulse"></div>
                  <div className="h-16 w-16 rounded-full bg-slate-950 border-3 border-slate-800 flex items-center justify-center">
                    <FiRefreshCw className="h-8 w-8 text-primary animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold tracking-tight text-white">
                    Weaving Your Adventure...
                  </h3>
                  <p className="text-slate-400 text-sm font-mono tracking-wide mt-2 min-h-6">
                    {loadingMsg}
                  </p>
                </div>

                <div className="w-full max-w-sm h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary animate-gradient w-[80%] rounded-full"></div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: STORY GAMEPLAY PLAYER */}
            {step === 'playing' && story && currentNode && (
              <motion.div
                key="playing"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-6"
              >
                {/* 7-LOCATION VISUAL ADVENTURE PROGRESS MAP */}
                <div className="kids-panel p-4 space-y-3 border-accent overflow-hidden relative">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
                    <FiMapPin className="text-accent animate-bounce" />
                    <span>Visual Adventure Map</span>
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-7 gap-3 bg-slate-950/70 border border-slate-800/80 p-4 rounded-2xl relative overflow-hidden">
                    {MAP_LOCATIONS.map((loc, idx) => {
                      // Map active state to depth
                      const isActive = history.length === idx;
                      const isCompleted = history.length > idx;
                      return (
                        <div key={loc.name} className="relative flex flex-col items-center">
                          <div 
                            className={`h-11 w-11 rounded-full flex items-center justify-center text-xl border-2 transition-all duration-300 relative z-10 ${
                              isActive 
                                ? 'border-white scale-110 shadow-md shadow-accent/50 animate-pulse'
                                : isCompleted 
                                ? 'border-success'
                                : 'border-slate-800 opacity-30'
                            }`}
                            style={{
                              backgroundColor: isActive || isCompleted ? loc.color : '#0d0c22'
                            }}
                          >
                            <span>{loc.icon}</span>
                            {isCompleted && (
                              <div className="absolute -top-1 -right-1 bg-success text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-bold">
                                ✓
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 mt-1 uppercase text-center max-w-[80px] truncate">
                            {loc.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Popups indicators for collected items */}
                {currentNode.item_collected && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-secondary/20 border-2 border-secondary/40 rounded-2xl flex items-center gap-3 text-secondary text-xs font-black shadow-lg"
                  >
                    <span>🎁 Item Collected:</span>
                    <span>You discovered the **{currentNode.item_collected}**! Added to your adventure backpack.</span>
                  </motion.div>
                )}

                {currentNode.achievement_unlocked && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-3 bg-accent/20 border-2 border-accent/40 rounded-2xl flex items-center gap-3 text-accent text-xs font-black shadow-lg"
                  >
                    <span>🏅 Badge Earned:</span>
                    <span>Unlocked: **{currentNode.achievement_unlocked}**! Look in your journal to read it!</span>
                  </motion.div>
                )}

                {/* MINI GAME OVERLAY CONTAINER */}
                {currentNode.mini_game && !miniGameSolved && (
                  <div className="kids-panel p-6 border-accent bg-[#1b1c3b] space-y-4 shadow-2xl relative z-25 border-t-8">
                    <div className="text-center space-y-1">
                      <span className="px-3 py-1 bg-accent/20 text-accent text-[10px] font-black rounded-full border border-accent/30 uppercase tracking-widest">
                        Challenge Lock
                      </span>
                      <h3 className="text-2xl font-bold text-white">Solve to Proceed!</h3>
                      <p className="text-slate-300 text-xs font-semibold">
                        Complete this quick child-friendly mini-game to unlock the paths ahead.
                      </p>
                    </div>

                    {/* Star Connection Game */}
                    {activeMiniGame === 'stars' && (
                      <div className="flex flex-col items-center justify-center p-6 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-4">
                        <div className="text-xs font-bold text-slate-400">
                          Click stars in sequence: 1 ➡️ 2 ➡️ 3 ➡️ 4
                        </div>
                        <div className="flex gap-4 items-center justify-center h-28 relative w-full">
                          {[1, 2, 3, 4].map(num => {
                            const selected = starPath.includes(num);
                            return (
                              <button
                                key={num}
                                onClick={() => handleStarClick(num)}
                                className={`h-14 w-14 rounded-full flex flex-col items-center justify-center text-lg font-bold border-2 transition-all transform active:scale-95 ${
                                  selected 
                                    ? 'bg-yellow-400 border-white text-slate-950 scale-105' 
                                    : 'bg-slate-900 border-slate-800 text-slate-400'
                                }`}
                              >
                                <span>⭐</span>
                                <span className="text-[10px]">{num}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Bubble Pop Game */}
                    {activeMiniGame === 'bubbles' && (
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-3xl border border-slate-800 relative min-h-[180px] overflow-hidden">
                        <div className="text-xs font-bold text-slate-400 mb-2">
                          Pop all {bubbles.length} magical bubbles!
                        </div>
                        <div className="relative w-full h-[180px] bg-slate-900/50 rounded-2xl overflow-hidden">
                          {bubbles.map(b => (
                            <button
                              key={b.id}
                              onClick={() => handleBubblePop(b.id)}
                              className="absolute bg-sky-400/30 border-2 border-sky-300 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg cursor-pointer transform hover:scale-105 transition-all"
                              style={{
                                left: `${b.x}%`,
                                top: `${b.y}%`,
                                width: `${b.size}px`,
                                height: `${b.size}px`,
                                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
                              }}
                            >
                              🫧
                            </button>
                          ))}
                          {bubbles.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500 font-bold">
                              All bubbles popped!
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Memory Matching Game */}
                    {activeMiniGame === 'memory' && (
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-4">
                        <div className="text-xs font-bold text-slate-400">
                          Flip and match matching pairs!
                        </div>
                        <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                          {memoryCards.map((card) => {
                            const revealed = card.isFlipped || card.isMatched;
                            return (
                              <button
                                key={card.id}
                                onClick={() => handleCardClick(card)}
                                className={`h-16 rounded-2xl flex items-center justify-center text-3xl border-3 transition-all transform active:scale-95 ${
                                  revealed 
                                    ? 'bg-purple-900 border-purple-400 text-white' 
                                    : 'bg-slate-900 border-slate-850'
                                }`}
                              >
                                {revealed ? card.val : '❓'}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Crystal Matcher Game */}
                    {activeMiniGame === 'crystals' && (
                      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-3xl border border-slate-800 space-y-4">
                        <div className="text-xs font-bold text-slate-400">
                          Click circles so they all match the same color!
                        </div>
                        <div className="grid grid-cols-3 gap-3 w-full max-w-[180px]">
                          {crystalGrid.map((c) => (
                            <button
                              key={c.id}
                              onClick={() => handleGridClick(c.id)}
                              className="h-10 w-10 rounded-full border-2 border-white/60 transition-all transform active:scale-90"
                              style={{ backgroundColor: c.color }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Node Story Card */}
                <div className="kids-panel p-6 md:p-8 space-y-6 border-primary relative">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-black text-primary tracking-widest uppercase">
                        {currentNode.chapter || 'Chapter'}
                      </span>
                      <h2 className="text-2xl font-black text-white leading-tight">
                        {story.title}
                      </h2>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase">
                      Adventure Depth: {history.length}
                    </div>
                  </div>

                  {/* Main text content */}
                  <p className="text-slate-100 text-lg leading-relaxed font-medium min-h-[100px]">
                    {currentNode.content}
                  </p>
                </div>

                {/* Choices Panel */}
                {(!currentNode.mini_game || miniGameSolved) && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">
                      Select Your Move:
                    </h4>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {currentNode.options && currentNode.options.map((opt, idx) => {
                        const isLocked = opt.required_item && !inventory.includes(opt.required_item);
                        return (
                          <button
                            key={idx}
                            onClick={() => handleChooseOption(opt)}
                            className={`kids-card p-5 text-left border-3 flex items-center justify-between group hover:-translate-y-0.5 transition-all duration-200 ${
                              isLocked 
                                ? 'opacity-40 border-slate-900 hover:border-slate-900 hover:-translate-y-0 cursor-not-allowed bg-slate-950/40' 
                                : 'hover:border-primary/50 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className={`h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-black text-base transition-all duration-200 ${
                                isLocked ? 'text-slate-600' : 'text-slate-400 group-hover:bg-primary/20 group-hover:border-primary/30 group-hover:text-primary'
                              }`}>
                                {idx === 0 ? 'A' : idx === 1 ? 'B' : 'C'}
                              </span>
                              <div className="space-y-0.5">
                                <span className={`font-bold text-sm md:text-base ${isLocked ? 'text-slate-500' : 'text-slate-200 group-hover:text-white'}`}>
                                  {opt.text}
                                </span>
                                {isLocked && (
                                  <div className="text-[10px] text-red-400 font-bold uppercase">
                                    🔒 Locked (Requires item: **{opt.required_item}**)
                                  </div>
                                )}
                              </div>
                            </div>
                            {!isLocked && <FiChevronRight className="h-5 w-5 text-slate-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 4: CINEMATIC ENDING SCREEN */}
            {step === 'ending' && story && currentNode && (
              <motion.div
                key="ending"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="w-full flex flex-col gap-6"
              >
                {/* Visual Victory Splash banner */}
                <div className="kids-panel overflow-hidden relative border-secondary">
                  <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${
                    currentNode.is_winning_ending 
                      ? 'from-success to-accent' 
                      : 'from-primary to-orange-500'
                  }`}></div>
                  
                  <div className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                      {currentNode.is_winning_ending ? (
                        <div className="h-24 w-24 rounded-full bg-success/15 border-3 border-success flex items-center justify-center shadow-lg shadow-success/20 text-success animate-pulse text-4xl">
                          🏆
                        </div>
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-primary/15 border-3 border-primary flex items-center justify-center shadow-lg shadow-primary/20 text-primary animate-bounce text-4xl">
                          💀
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className={`text-xs font-black tracking-widest uppercase ${
                        currentNode.is_winning_ending ? 'text-success' : 'text-primary'
                      }`}>
                        {currentNode.is_winning_ending ? 'VICTORY ACHIEVED!' : 'AN INTERESTING END'}
                      </span>
                      <h2 className="text-3xl font-black text-white">
                        {currentNode.ending_type || 'Adventure Concluded'}
                      </h2>
                    </div>

                    <p className="text-slate-100 text-lg leading-relaxed max-w-xl mx-auto font-medium bg-slate-950/60 p-5 rounded-2xl border border-slate-900">
                      {currentNode.content}
                    </p>
                  </div>
                </div>

                {/* Final Adventure statistics summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Points tally */}
                  <div className="kids-panel p-5 border-success space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Adventure Points Collected</h4>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900">
                        <span className="text-2xl">❤️</span>
                        <div className="text-xs font-bold text-slate-400">Kindness</div>
                        <div className="text-lg font-black text-white">{rewards.kindness}</div>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900">
                        <span className="text-2xl">🧠</span>
                        <div className="text-xs font-bold text-slate-400">Wisdom</div>
                        <div className="text-lg font-black text-white">{rewards.wisdom}</div>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900">
                        <span className="text-2xl">💪</span>
                        <div className="text-xs font-bold text-slate-400">Courage</div>
                        <div className="text-lg font-black text-white">{rewards.courage}</div>
                      </div>
                      <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-900">
                        <span className="text-2xl">🤝</span>
                        <div className="text-xs font-bold text-slate-400">Friendship</div>
                        <div className="text-lg font-black text-white">{rewards.friendship}</div>
                      </div>
                    </div>
                  </div>

                  {/* Summary of Items and Achievements */}
                  <div className="kids-panel p-5 border-secondary space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-2">Collected Artifacts</h4>
                      {inventory.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {inventory.map(item => (
                            <span key={item} className="px-3 py-1 bg-slate-950 border border-slate-900 rounded-xl text-xs font-bold text-secondary">
                              🔑 {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic font-medium">None collected.</span>
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-2">Achievements Earned</h4>
                      {achievements.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {achievements.map(ach => (
                            <span key={ach} className="px-3 py-1 bg-slate-950 border border-slate-900 rounded-xl text-xs font-bold text-accent">
                              🏅 {ach}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic font-medium">None unlocked.</span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Restart Controls */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleRestartStory}
                    className="kids-btn-secondary flex-1 py-4 font-bold text-white flex items-center justify-center gap-2 group"
                  >
                    <FiRefreshCw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
                    <span>Replay Story</span>
                  </button>
                  <button
                    onClick={handleCreateNew}
                    className="kids-btn-primary flex-1 py-4 font-bold text-white flex items-center justify-center gap-2"
                  >
                    <FiPlus className="h-5 w-5" />
                    <span>Explore New Realm</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* COLLAPSIBLE JOURNAL DRAWER */}
      <AnimatePresence>
        {showJournal && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 bg-[#0d0c22] border-t-4 border-primary z-50 p-6 shadow-2xl max-h-[400px] overflow-y-auto"
          >
            <div className="w-full max-w-5xl mx-auto space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  📖 {selectedChar.name}'s Adventure Journal
                </h3>
                <button
                  onClick={() => setShowJournal(false)}
                  className="px-3 py-1 bg-slate-900 rounded-lg text-xs font-bold text-slate-400 hover:text-white border border-slate-800"
                >
                  Close Journal
                </button>
              </div>

              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((hist, idx) => (
                    <div key={idx} className="flex gap-4 items-start text-sm leading-relaxed text-slate-300">
                      <span className="h-7 w-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                        {idx + 1}
                      </span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{hist.chapter}</span>
                        <p className="text-slate-400 italic">"{hist.content}"</p>
                        <p className="text-white font-bold">
                          Selected Move: <span className="text-secondary">{hist.optionText}</span>
                        </p>
                        <div className="flex gap-2 mt-1">
                          {hist.item && (
                            <span className="px-2 py-0.5 bg-slate-900 text-secondary text-[10px] rounded border border-slate-800 font-bold">
                              🎒 Found: {hist.item}
                            </span>
                          )}
                          {hist.achievement && (
                            <span className="px-2 py-0.5 bg-slate-900 text-accent text-[10px] rounded border border-slate-800 font-bold">
                              🏅 Unlocked: {hist.achievement}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-xs italic font-medium text-center py-6">Your journal is currently empty. Make some choices to write pages!</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl text-center text-xs text-slate-600 font-mono mt-8 border-t border-slate-900/60 pt-4 relative z-20">
        &copy; {new Date().getFullYear()} DESTINYPATH KIDS. DISNEY-GRADE INTERACTIVE PLAYGROUND.
      </footer>
    </div>
  );
}
