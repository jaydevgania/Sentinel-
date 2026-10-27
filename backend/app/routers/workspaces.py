from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Workspace, User
from ..seed_data import seed_demo_workspace, DEMO_WORKSPACE_ID, SAMPLE_POSTS

router = APIRouter(prefix="/api", tags=["workspaces"])

@router.post("/workspaces/demo")
def reset_demo_workspace(db: Session = Depends(get_db)):
    ws = seed_demo_workspace(db, force_reset=True)
    return {
        "status": "success",
        "message": "Demo workspace successfully reseeded with Nimbus Coffee brand guidelines.",
        "workspace_id": ws.id,
        "brand_name": ws.brand_name
    }

@router.get("/workspaces/demo")
def get_demo_workspace(db: Session = Depends(get_db)):
    ws = db.query(Workspace).filter(Workspace.id == DEMO_WORKSPACE_ID).first()
    if not ws:
        ws = seed_demo_workspace(db, force_reset=False)
    
    users = db.query(User).filter(User.workspace_id == ws.id).all()
    return {
        "workspace": {
            "id": ws.id,
            "name": ws.name,
            "brand_name": ws.brand_name
        },
        "users": [{"id": u.id, "name": u.name, "role": u.role} for u in users],
        "sample_posts": SAMPLE_POSTS
    }

@router.get("/samples")
def get_sample_posts():
    return SAMPLE_POSTS
