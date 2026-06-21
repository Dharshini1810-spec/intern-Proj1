import uuid
import random
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


def generate_story_task(job_id: str, theme: str, character: str, session_id: str):
    db = SessionLocal()

    try:
        job = db.query(StoryJob).filter(StoryJob.job_id == job_id).first()

        if not job:
            return
      
        try:
            job.status = "processing"
            db.commit()

            # Create and save the Story
            story = Story(title=f"The Quest for {theme}", character=character, session_id=session_id)
            db.add(story)
            db.commit()

            # Create 59 story nodes programmatically
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
                    
                # Determine rewards (Kindness, Wisdom, Courage, Friendship)
                # Set seed so it's deterministic per node index and theme/character length
                random.seed(i + len(theme) + len(character))
                
                categories = ["kindness", "wisdom", "courage", "friendship"]
                cat = random.choice(categories)
                pts = random.randint(10, 25)
                rewards = {cat: pts}
                
                # Determine items collected
                item = None
                if i == 1:
                    item = "Treasure Map"
                elif i == 2:
                    item = "Magic Key"
                elif i == 3:
                    item = "Crystal"
                elif i == 5:
                    item = "Potion"
                elif i == 8:
                    item = "Ancient Relic"
                elif i == 11:
                    item = "Potion"
                    
                # Determine achievements
                ach = None
                if i == 14:
                    ach = "Dragon Friend"
                elif i == 18:
                    ach = "Puzzle Solver"
                elif i == 22:
                    ach = "Treasure Hunter"
                elif i == 26:
                    ach = "Explorer Badge"
                elif i == 30:
                    ach = "Legendary Adventurer"
                    
                # Mini Game setup
                mini_game = None
                if i in range(4, 13):
                    mini_games_list = ["memory", "bubbles", "stars", "crystals"]
                    mini_game = mini_games_list[(i - 4) % len(mini_games_list)]
                    
                # Determine ending type
                ending_type = None
                is_winning = False
                if is_ending:
                    endings_list = [
                        ("Princess Luna's Starlight Crown Ending", True),
                        ("Astronaut Alex's Deep Space Legend Ending", True),
                        ("Pirate Penny's Gold Treasure Ending", True),
                        ("Wizard Wally's Sparkle Magic Ending", True),
                        ("Robot Rex's High-Tech Victory Ending", True),
                        ("Dino Dave's Prehistoric Jungle Ending", True),
                        ("Explorer Emma's Compass Guide Ending", True),
                        ("Funny Ending: The Giant Sneeze", True),
                        ("Secret Ending: The Cosmic Portal", True),
                        ("Friendship Ending: Giant Feast", True),
                        ("Treasure Ending: Golden Chest", True),
                        ("Hero Ending: Guard of Honor", True),
                        ("Legendary Ending: Star Ascension", True),
                        ("Funny Ending: Dancing Goblins", False),
                    ]
                    ending_type, is_winning = endings_list[(i - 45) % len(endings_list)]
                    
                # Generate content text child-friendly
                content = ""
                if i == 0:
                    content = f"Greetings, {character}! Your magical journey to the legendary realm of {theme} begins here. You stand at the crossroads of destiny. Ahead lies a whispering, glowing forest path, a winding stone bridge leading to a majestic golden castle, and a dark cavern glowing with crystal shards. Which way will you venture, brave explorer?"
                elif i == 1:
                    content = f"You step into the Whispering Forest. The trees sway and hum a soft melody. Suddenly, a tiny glowing elf leaps out from a hollow trunk! 'Hello, {character}! To cross the forest, you need a map. Take this!' The elf hands you a map."
                elif i == 2:
                    content = f"You march onto the castle bridge. A giant stone golem guards the archway. 'Halt, brave {character}! Solve my riddle: I have keys but no locks, space but no room. What am I?' You answer correctly, and the golem rewards you with a shimmering key!"
                elif i == 3:
                    content = f"Following the crystal trail, you enter the cave. The walls sparkle with thousands of stars. In the center, a magical crystal shard glows warm and bright. You pick it up, feeling its energy surge!"
                elif i == 4:
                    content = f"You arrive at a gated forest portal. A magic board with matching cards blocks the path. To unlock it, we must match the cards and test our memory!"
                elif i == 5:
                    content = f"Deeper in the forest, you find a witch's cottage smelling of candy. Inside, a boiling cauldron glows bright blue. The friendly witch offers you a magical glowing potion. Do you drink it or keep exploring?"
                elif i == 6:
                    content = f"The dungeon floor leads to a roaring lava forge. A mechanical iron dragon lies chained next to a pile of gold. Do you help free the dragon or try to sneak past to get the treasure?"
                elif i == 7:
                    content = f"A golden gate stands before the library. A mystical wall of floating bubbles appears. We must catch the sparkling bubbles to reveal the path!"
                elif i == 8:
                    content = f"Inside the castle library, you find a secret wall compartment containing a dusty ancient relic. Suddenly, a ghost librarian appears! Do you talk to the ghost or grab the relic and run?"
                elif i == 9:
                    content = f"The kitchen smells of baked cookies. A friendly chef goblin needs help connecting the star constellation to bake his master pie. Let's trace the stars!"
                elif i == 10:
                    content = f"A crystalline door stands before you. Several floating crystals of different colors need to be matched to open the path. Let's match the crystals!"
                elif i == 11:
                    content = f"You reach a shimmering underground lake. A friendly dolphin pops its head up, offering to swim you to the Crystal Caves, while a rope ladder leads up into a magical cloud kingdom. Where next?"
                elif i == 12:
                    content = f"In a corner of the cave, you find a giant locked crystal chest. Before you can open it, you must solve a card matching game!"
                elif i <= 30:
                    content = f"You face a grand challenge on the path! Obstacles block your way, but with your special ability, you can overcome them. You must make your choice to reach the legendary showdown portal!"
                elif i <= 44:
                    content = f"Wow! You have entered the Final Quest Showdown chamber! The magical guardian of {theme} stands before you. They offer one final riddling test of courage. You must choose how to make your final approach!"
                else:
                    # Endings
                    if is_winning:
                        content = f"Hooray, {character}! You successfully completed the quest in {theme}! With your wisdom and courage, you unlocked the mythical {ending_type}. The whole realm celebrates your victory!"
                    else:
                        content = f"Oh no, {character}! A trick wall closed behind you, or the sleeping giant woke up! Though this path ends here with a funny twist, your brave spirit will shine on. Try again for a different ending!"

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
                
            db.commit() # Now all 59 nodes have database IDs!

            # Update options linking to actual database IDs
            # Node 0 (Root) -> 3 options leading to 1, 2, 3
            nodes[0].options = [
                {"text": "🚪 Explore the Whispering Forest", "node_id": nodes[1].id},
                {"text": "🏰 Cross the Majestic Castle Bridge", "node_id": nodes[2].id},
                {"text": "💎 Navigate the Crystal Cavern", "node_id": nodes[3].id}
            ]
            
            # Nodes 1, 2, 3 (Level 1) -> 3 options leading to:
            # Node 1 -> 4, 5, 6
            # Node 2 -> 7, 8, 9
            # Node 3 -> 10, 11, 12
            nodes[1].options = [
                {"text": "🧙 Talk to the Sprite", "node_id": nodes[4].id},
                {"text": "🌲 Follow the glowing trail deeper", "node_id": nodes[5].id},
                {"text": "🏠 Climb the grand tree house", "node_id": nodes[6].id}
            ]
            nodes[2].options = [
                {"text": "🧠 Solve the Golem's riddle", "node_id": nodes[7].id},
                {"text": "🚪 Peek into the castle guardhouse", "node_id": nodes[8].id},
                {"text": "🌊 Look over the edge of the bridge", "node_id": nodes[9].id}
            ]
            nodes[3].options = [
                {"text": "🛑 Touch the glowing ruby pillar", "node_id": nodes[10].id},
                {"text": "🎵 Follow the echoes of music", "node_id": nodes[11].id},
                {"text": "👑 Sit on the shiny crystal throne", "node_id": nodes[12].id}
            ]
            
            # Nodes 4 to 12 (Level 2) -> 2 options leading to 13 to 30
            for j in range(4, 13):
                left_child_idx = 2 * j + 5  # 4 -> 13, 5 -> 15, etc.
                right_child_idx = 2 * j + 6 # 4 -> 14, 5 -> 16, etc.
                
                # Make choices distinct and thematic
                choices_templates = [
                    ("Take the magic bubble trail", "Cross the log bridge"),
                    ("Enter the tree door", "Swim across the lake"),
                    ("Fly with the forest eagle", "Creep under the bushes"),
                    ("Enter the grand library", "Creep into the dungeon"),
                    ("Follow the golden carpet", "Climb the spiral staircase"),
                    ("Walk into the kitchen", "Check the secret garden"),
                    ("Slide down the crystal slide", "Cross the lava stream"),
                    ("Step into the cave tunnel", "Climb the rope ladder"),
                    ("Open the heavy crystal chest", "Examine the wall glyphs")
                ]
                text_a, text_b = choices_templates[j - 4]
                nodes[j].options = [
                    {"text": f"🚪 {text_a}", "node_id": nodes[left_child_idx].id},
                    {"text": f"🔑 {text_b}", "node_id": nodes[right_child_idx].id}
                ]
                
            # Nodes 13 to 30 (Level 3) -> 2 options leading to 31 to 44
            for j in range(13, 31):
                left_child_idx = 31 + (j - 13) % 14
                right_child_idx = 31 + (j - 13 + 1) % 14
                
                # Option A requires a specific item from the inventory
                items_needed = [
                    "Treasure Map", "Treasure Map", "Treasure Map",
                    "Magic Key", "Magic Key", "Magic Key",
                    "Crystal", "Crystal", "Crystal",
                    "Potion", "Potion", "Potion",
                    "Ancient Relic", "Ancient Relic", "Ancient Relic",
                    "Magic Key", "Magic Key", "Magic Key"
                ]
                req_item = items_needed[j - 13]
                
                nodes[j].options = [
                    {
                        "text": f"🏆 Use {req_item} for a legendary path",
                        "node_id": nodes[left_child_idx].id,
                        "required_item": req_item
                    },
                    {
                        "text": "🚶 Take the normal path of destiny",
                        "node_id": nodes[right_child_idx].id
                    }
                ]
                
            # Nodes 31 to 44 (Level 4) -> 2 options leading to endings 45 to 58
            for j in range(31, 45):
                left_child_idx = 45 + (j - 31) % 14
                right_child_idx = 45 + (j - 31 + 1) % 14
                
                nodes[j].options = [
                    {"text": "✨ Reach the ultimate victory gate", "node_id": nodes[left_child_idx].id},
                    {"text": "🌈 Walk into the magical conclusion", "node_id": nodes[right_child_idx].id}
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



    
        