import uuid
import random
import json
from typing import Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends, Cookie, BackgroundTasks, Response
from sqlalchemy.orm import Session

from core.config import settings
from db.database import get_db, SessionLocal
from models.story import Story, StoryNode
from models.job import StoryJob
from schemas.story import (
    CompleteStoryResponse, CompleteStoryNodeResponse, CreateStoryRequest, StoryOptionsSchemas
) 
from schemas.job import StoryJobResponse

router = APIRouter(
    prefix="/stories",
    tags=["stories"]
)
 
def get_sesssion_id(session_id: Optional[str] = Cookie(None)):
    if not session_id:
        session_id = str(uuid.uuid4())
    return session_id


@router.post("/create", response_model=StoryJobResponse)
def create_story( 
        request: CreateStoryRequest,
        background_tasks: BackgroundTasks,
        response: Response,
        session_id: str = Depends(get_sesssion_id),
        db: Session = Depends(get_db)  
):
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="none" if not settings.DEBUG else "lax"
    )
     
    job_id = str(uuid.uuid4())

    job = StoryJob(
        job_id=job_id,
        theme=request.theme,
        status="pending",
        session_id=session_id
    )
    db.add(job)
    db.commit()

    background_tasks.add_task(
        generate_story_task, 
        job_id=job_id, 
        theme=request.theme, 
        character=request.character,
        session_id=session_id
    ) 

    return job


# ---------------------------------------------------------------------------
# Groq AI Story Generation
# ---------------------------------------------------------------------------

def _get_groq_client():
    """Return a Groq client if GROQ_API_KEY is configured, else None."""
    try:
        from groq import Groq
        if settings.GROQ_API_KEY:
            return Groq(api_key=settings.GROQ_API_KEY)
    except Exception as e:
        print(f"Groq Client Init Error: {e}")
        pass
    return None


def _generate_story_content_with_groq(client, character: str, theme: str, node_index: int,
                                       chapter: str, location: str, is_ending: bool,
                                       is_winning: bool, ending_type: str = None) -> str:
    """Use Groq to generate a single story node's content."""
    if is_ending:
        if is_winning:
            system_prompt = (
                "You are a magical children's story narrator for ages 4-10. "
                "Write vivid, exciting, joyful victory ending paragraphs. "
                "Keep it to 3-4 sentences. Use simple, happy words. "
                "Make the child feel like a true hero."
            )
            user_prompt = (
                f"Write a victory ending for a children's adventure story.\n"
                f"Hero: {character}\n"
                f"Realm/Theme: {theme}\n"
                f"Ending Type: {ending_type}\n"
                f"Location: {location}\n"
                f"Write a joyful, celebratory 3-4 sentence paragraph where the hero triumphs!"
            )
        else:
            system_prompt = (
                "You are a fun children's story narrator for ages 4-10. "
                "Write humorous, light-hearted 'funny fail' endings. "
                "Keep it to 3 sentences. Make it silly and fun, not scary. "
                "Always encourage the child to try again."
            )
            user_prompt = (
                f"Write a funny, silly defeat ending for a children's adventure story.\n"
                f"Hero: {character}\n"
                f"Realm/Theme: {theme}\n"
                f"Location: {location}\n"
                f"Write 3 humorous sentences. Make it silly and encourage trying again!"
            )
    else:
        system_prompt = (
            "You are a magical children's story narrator for ages 4-10. "
            "Write vivid, adventurous story scenes. "
            "Keep it to 3-4 sentences. Use simple, exciting words. "
            "End with a sense of wonder and anticipation. "
            "Do not include choices — just narrate the scene."
        )
        user_prompt = (
            f"Write a story scene for a children's interactive adventure.\n"
            f"Hero: {character}\n"
            f"Realm/Theme: {theme}\n"
            f"Chapter: {chapter}\n"
            f"Location: {location}\n"
            f"Scene number: {node_index + 1}\n"
            f"Write a vivid 3-4 sentence scene. End with suspense or wonder."
        )

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=200,
            temperature=0.85,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq API Error in content: {e}")
        return None  # Fall back to static content


def _generate_choice_labels_with_groq(client, character: str, theme: str, location: str) -> list:
    """Use Groq to generate 2-3 creative choice labels for a story node."""
    system_prompt = (
        "You are a children's story game designer. "
        "Generate 3 short, exciting path choices for a child hero. "
        "Each choice should be max 6 words and start with an action verb. "
        "Return ONLY a JSON array of 3 strings, nothing else."
    )
    user_prompt = (
        f"Generate 3 exciting path choices for:\n"
        f"Hero: {character}\nTheme: {theme}\nLocation: {location}\n"
        f"Return only a JSON array like: [\"Choice 1\", \"Choice 2\", \"Choice 3\"]"
    )
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=100,
            temperature=0.9,
        )
        raw = response.choices[0].message.content.strip()
        # Extract JSON array
        start = raw.find("[")
        end = raw.rfind("]") + 1
        if start != -1 and end > start:
            choices = json.loads(raw[start:end])
            if isinstance(choices, list) and len(choices) >= 2:
                return choices[:3]
    except Exception:
        pass
    return None


# ---------------------------------------------------------------------------
# Location / Chapter Helpers
# ---------------------------------------------------------------------------

LOCATIONS = [
    "The Enchanted Kingdom Gate",
    "The Whispering Crystal Forest",
    "The Golden Castle Bridge",
    "The Glowing Crystal Cavern",
    "The Sprite's Glade",
    "The Witch's Candy Cottage",
    "The Iron Dragon's Forge",
    "The Mystical Library",
    "The Secret Garden",
    "The Underground Crystal Lake",
    "The Cloud Kingdom",
    "The Final Quest Showdown Chamber",
    "The Victory Celebration Hall",
]

STATIC_CHOICES_LEVEL0 = [
    ("🌲 Explore the Whispering Forest", "🏰 Cross the Castle Bridge", "💎 Enter the Crystal Cavern"),
]

STATIC_CHOICES_LEVEL1 = [
    ("🧙 Talk to the Sprite", "🌟 Follow the glowing trail", "🏠 Climb the tree house"),
    ("🧠 Solve the Golem's riddle", "🚪 Peek into the guardhouse", "🌊 Look over the bridge"),
    ("🛑 Touch the ruby pillar", "🎵 Follow the music echoes", "👑 Sit on the crystal throne"),
]

STATIC_CHOICE_PAIRS = [
    ("🫧 Take the bubble trail", "🪵 Cross the log bridge"),
    ("🌳 Enter the tree door", "🏊 Swim across the lake"),
    ("🦅 Fly with the eagle", "🌿 Creep under bushes"),
    ("📚 Enter the grand library", "🏚️ Creep into the dungeon"),
    ("✨ Follow the golden carpet", "🌀 Climb the spiral staircase"),
    ("🍪 Walk into the kitchen", "🌸 Check the secret garden"),
    ("🛝 Slide down the crystal slide", "🌋 Cross the lava stream"),
    ("🕳️ Step into the cave tunnel", "🪜 Climb the rope ladder"),
    ("💼 Open the crystal chest", "🔍 Examine the wall glyphs"),
]

ENDINGS = [
    ("Princess Luna's Starlight Crown", True),
    ("Astronaut Alex's Deep Space Legend", True),
    ("Pirate Penny's Golden Treasure", True),
    ("Wizard Wally's Sparkle Magic", True),
    ("Robot Rex's High-Tech Victory", True),
    ("Dino Dave's Prehistoric Jungle", True),
    ("Explorer Emma's Compass Guide", True),
    ("The Cosmic Portal Secret Ending", True),
    ("The Friendship Giant Feast", True),
    ("The Legendary Star Ascension", True),
    ("The Golden Chest Treasure Ending", True),
    ("The Guard of Honor Hero Ending", True),
    ("The Dancing Goblins Funny Ending", False),
    ("The Giant Sneeze Silly Ending", False),
]

MINI_GAMES = ["memory", "bubbles", "stars", "crystals"]
REWARD_CATEGORIES = ["kindness", "wisdom", "courage", "friendship"]
ITEMS = {1: "Treasure Map", 2: "Magic Key", 3: "Crystal", 5: "Potion", 8: "Ancient Relic", 11: "Potion"}
ACHIEVEMENTS = {14: "Dragon Friend", 18: "Puzzle Solver", 22: "Treasure Hunter",
                26: "Explorer Badge", 30: "Legendary Adventurer"}


def _static_content(i: int, character: str, theme: str, ending_type: str, is_winning: bool) -> str:
    """Fallback static content for each node index."""
    if i == 0:
        return (f"Welcome, brave {character}! Your legendary quest in the magical realm of {theme} "
                f"begins now. You stand at a glowing crossroads bathed in golden light. Three mystical "
                f"paths shimmer before you — each hiding wonders and secrets beyond your imagination. "
                f"Which path calls to your brave heart?")
    elif i == 1:
        return (f"You step into the Whispering Forest, where the trees sway and hum a soft melody. "
                f"A tiny glowing elf leaps from a hollow trunk! 'Hello, {character}! The forest has "
                f"been waiting for you,' it whispers, pressing a glowing Treasure Map into your hands.")
    elif i == 2:
        return (f"You march onto the grand Castle Bridge. A stone golem with glowing emerald eyes "
                f"blocks the way. 'Brave {character}, answer my riddle: I have keys but no locks, "
                f"space but no room. What am I?' You answer correctly — a keyboard! — and the golem "
                f"bows, gifting you a shimmering Magic Key.")
    elif i == 3:
        return (f"You follow the crystal trail into a sparkling cave. The walls glow with thousands "
                f"of embedded stars. At the center, a warm Crystal shard pulses with ancient magic. "
                f"As you pick it up, a rush of power flows through your veins!")
    elif i == 4:
        return (f"A gated forest portal blocks your path. A magical memory board hovers before you — "
                f"the cards must be matched to unlock the gate. Time to put your memory to the test!")
    elif i == 5:
        return (f"Deep in the forest, you find a witch's cottage that smells of cinnamon and starlight. "
                f"A friendly witch with a purple hat offers you a glowing blue Potion. "
                f"'It will give you a special power,' she winks mysteriously.")
    elif i == 6:
        return (f"You discover a roaring lava forge! A mechanical Iron Dragon sits chained beside "
                f"a mountain of golden coins. Its eyes flicker — it seems to be asking for help. "
                f"Do you free the dragon, or grab the gold and sneak away?")
    elif i == 7:
        return (f"A mystical wall of floating rainbow bubbles blocks the path to the grand library! "
                f"Each bubble holds a letter or number. Catch them all to reveal the secret password "
                f"and open the library doors!")
    elif i == 8:
        return (f"Inside the castle library, dusty bookshelves tower to the ceiling. You spot a "
                f"secret compartment containing an Ancient Relic wrapped in golden cloth. Suddenly "
                f"a ghost librarian floats through the wall — 'That relic has a curse!' it warns.")
    elif i == 9:
        return (f"The kitchen smells of warm cookies and cinnamon pie. A friendly goblin chef "
                f"needs your help connecting the star constellation to activate his magic oven. "
                f"Let's trace the stars together!")
    elif i == 10:
        return (f"A crystalline door blocks your path, locked by color-coded crystal gems. "
                f"Each gem must be matched to its twin to unlock the ancient mechanism. "
                f"The gems swirl and glow, waiting for you to solve the puzzle!")
    elif i == 11:
        return (f"You reach a shimmering underground lake lit by bioluminescent fish. "
                f"A friendly dolphin pops up and offers to carry you to the Crystal Caves, "
                f"while a magic rope ladder leads up into a floating cloud kingdom above!")
    elif i == 12:
        return (f"In the far corner of the cave sits a giant locked crystal chest, glowing "
                f"with rainbow light. 'Match the cards to open it!' a tiny fairy shouts. "
                f"The memory challenge begins!")
    elif i <= 30:
        location = LOCATIONS[min(i % len(LOCATIONS), len(LOCATIONS)-1)]
        return (f"You arrive at {location}, a breathtaking sight in the realm of {theme}! "
                f"Ancient glyphs on the walls seem to whisper your name, {character}. "
                f"A great challenge awaits — your courage and wisdom will be tested "
                f"as you choose your path forward!")
    elif i <= 44:
        return (f"The Final Quest Showdown Chamber awaits you, {character}! "
                f"The magical guardian of {theme} stands before you, wreathed in golden light. "
                f"'Prove your worth, brave hero!' the guardian booms. "
                f"One last choice stands between you and legendary glory!")
    else:
        if is_winning:
            return (f"VICTORY! Brave {character}, you have conquered the legendary realm of {theme}! "
                    f"With wisdom, courage, and a kind heart, you achieved the glorious {ending_type}! "
                    f"The entire realm erupts in celebration — fireworks paint the sky in your honor! "
                    f"You are now a true legend of the adventure world!")
        else:
            return (f"Oh no, {character}! A sneaky trick door snapped shut behind you — "
                    f"and then the Silly Sleeping Giant woke up with an enormous SNEEZE! "
                    f"ACHOO! It sent you tumbling through a rainbow slide back to the start. "
                    f"Don't worry — every hero tries again! Your next adventure will be even more amazing!")


def generate_story_task(job_id: str, theme: str, character: str, session_id: str):
    db = SessionLocal()

    try:
        job = db.query(StoryJob).filter(StoryJob.job_id == job_id).first()
        if not job:
            return

        try:
            job.status = "processing"
            db.commit()

            # Get Groq client (None if not configured)
            groq_client = _get_groq_client()

            # Create and save the Story
            story = Story(title=f"The Quest for {theme}", character=character, session_id=session_id)
            db.add(story)
            db.commit()

            nodes = []
            for i in range(59):
                is_root = (i == 0)
                is_ending = (i >= 45)

                # Determine chapter
                if i == 0:
                    chapter = "Chapter 1: The Beginning"
                elif i <= 3:
                    chapter = "Chapter 2: The Discovery"
                elif i <= 12:
                    chapter = "Chapter 3: The Adventure"
                elif i <= 30:
                    chapter = "Chapter 4: The Challenge"
                elif i <= 44:
                    chapter = "Chapter 5: The Final Quest"
                else:
                    chapter = "Chapter 6: The Conclusion"

                # Location for this node
                location = LOCATIONS[min(i % len(LOCATIONS), len(LOCATIONS)-1)]

                # Determine ending info
                ending_type = None
                is_winning = False
                if is_ending:
                    ending_type, is_winning = ENDINGS[(i - 45) % len(ENDINGS)]

                # Generate content via Groq, fall back to static
                content = None
                if groq_client:
                    content = _generate_story_content_with_groq(
                        groq_client, character, theme, i, chapter, location,
                        is_ending, is_winning, ending_type
                    )
                if not content:
                    content = _static_content(i, character, theme, ending_type, is_winning)

                # Rewards (deterministic seed)
                random.seed(i + len(theme) + len(character))
                cat = random.choice(REWARD_CATEGORIES)
                pts = random.randint(10, 25)
                rewards = {cat: pts}

                # Items, achievements, mini-games
                item = ITEMS.get(i)
                ach = ACHIEVEMENTS.get(i)
                mini_game = MINI_GAMES[(i - 4) % len(MINI_GAMES)] if i in range(4, 13) else None

                node = StoryNode(
                    story_id=story.id,
                    content=content,
                    is_root=is_root,
                    is_ending=is_ending,
                    is_winning_ending=is_winning,
                    chapter=chapter,
                    rewards=rewards,
                    item_collected=item,
                    achievement_unlocked=ach,
                    ending_type=ending_type,
                    mini_game=mini_game,
                    options=[]
                )
                nodes.append(node)
                db.add(node)

            db.commit()  # All 59 nodes have IDs now

            # ---------------------------------------------------------------
            # Wire up node options
            # ---------------------------------------------------------------

            # Node 0 → 3 paths (nodes 1, 2, 3)
            level0_choices = STATIC_CHOICES_LEVEL0[0]
            nodes[0].options = [
                {"text": level0_choices[0], "node_id": nodes[1].id},
                {"text": level0_choices[1], "node_id": nodes[2].id},
                {"text": level0_choices[2], "node_id": nodes[3].id},
            ]

            # Nodes 1-3 → 3 paths each (nodes 4-12)
            for j in range(3):
                choices = STATIC_CHOICES_LEVEL1[j]
                base = 4 + j * 3
                nodes[j + 1].options = [
                    {"text": choices[0], "node_id": nodes[base].id},
                    {"text": choices[1], "node_id": nodes[base + 1].id},
                    {"text": choices[2], "node_id": nodes[base + 2].id},
                ]

            # Nodes 4-12 → 2 paths each (nodes 13-30)
            for j in range(4, 13):
                left_idx = 2 * j + 5
                right_idx = 2 * j + 6
                pair = STATIC_CHOICE_PAIRS[j - 4]

                # Try Groq for choice labels
                ai_choices = None
                if groq_client and i < 20:  # limit Groq calls to speed up
                    ai_choices = _generate_choice_labels_with_groq(
                        groq_client, character, theme,
                        LOCATIONS[j % len(LOCATIONS)]
                    )

                if ai_choices and len(ai_choices) >= 2:
                    text_a = f"🌟 {ai_choices[0]}"
                    text_b = f"✨ {ai_choices[1]}"
                else:
                    text_a = pair[0]
                    text_b = pair[1]

                nodes[j].options = [
                    {"text": text_a, "node_id": nodes[left_idx].id},
                    {"text": text_b, "node_id": nodes[right_idx].id},
                ]

            # Nodes 13-30 → 2 paths (item-gated) → nodes 31-44
            items_needed = [
                "Treasure Map", "Treasure Map", "Treasure Map",
                "Magic Key", "Magic Key", "Magic Key",
                "Crystal", "Crystal", "Crystal",
                "Potion", "Potion", "Potion",
                "Ancient Relic", "Ancient Relic", "Ancient Relic",
                "Magic Key", "Magic Key", "Magic Key",
            ]
            for j in range(13, 31):
                left_idx = 31 + (j - 13) % 14
                right_idx = 31 + (j - 13 + 1) % 14
                req = items_needed[j - 13]
                nodes[j].options = [
                    {"text": f"🏆 Use {req} for a legendary path", "node_id": nodes[left_idx].id, "required_item": req},
                    {"text": "🚶 Take the normal path of destiny", "node_id": nodes[right_idx].id},
                ]

            # Nodes 31-44 → 2 paths → endings 45-58
            for j in range(31, 45):
                left_idx = 45 + (j - 31) % 14
                right_idx = 45 + (j - 31 + 1) % 14
                nodes[j].options = [
                    {"text": "✨ Reach the ultimate victory gate", "node_id": nodes[left_idx].id},
                    {"text": "🌈 Walk into the magical conclusion", "node_id": nodes[right_idx].id},
                ]

            db.commit()

            job.story_id = story.id
            job.status = "completed"
            job.completed_at = datetime.now()
            db.commit()

        except Exception as e:
            job.status = "failed"
            job.completed_at = datetime.now()
            job.error = str(e)
            db.commit()

    finally:
        db.close()


@router.get("/{story_id}/complete", response_model=CompleteStoryResponse)
def get_complete_story(
        story_id: int,
        session_id: str = Depends(get_sesssion_id),
        db: Session = Depends(get_db)
):
    story = db.query(Story).filter(
        Story.id == story_id,
        Story.session_id == session_id
    ).first()   
    if not story:
        raise HTTPException(status_code=404, detail="Story not found")
    
    complete_story = build_complete_story_tree(db, story)
    return complete_story


def build_complete_story_tree(db: Session, story: Story) -> CompleteStoryResponse:
    nodes = db.query(StoryNode).filter(StoryNode.story_id == story.id).all()
    
    all_nodes_dict = {}
    for node in nodes:
        options_list = []
        if node.options:
            for opt in node.options:
                options_list.append(StoryOptionsSchemas(
                    text=opt.get("text", ""),
                    node_id=opt.get("node_id"),
                    required_item=opt.get("required_item")
                ))
        all_nodes_dict[node.id] = CompleteStoryNodeResponse(
            id=node.id,
            content=node.content,
            is_ending=node.is_ending,
            is_winning_ending=node.is_winning_ending,
            options=options_list,
            chapter=node.chapter,
            rewards=node.rewards,
            item_collected=node.item_collected,
            achievement_unlocked=node.achievement_unlocked,
            ending_type=node.ending_type,
            mini_game=node.mini_game
        )
        
    root_node = next((node for node in nodes if node.is_root), None)
    root_node_response = None
    if root_node:
        root_node_response = all_nodes_dict.get(root_node.id)
        
    return CompleteStoryResponse(
        id=story.id,
        title=story.title,
        character=story.character,
        session_id=story.session_id,
        created_at=story.created_at,
        root_node=root_node_response,
        all_nodes=all_nodes_dict
    )