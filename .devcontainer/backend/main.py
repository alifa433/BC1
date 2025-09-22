from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # OK for a private Codespace
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Registration(BaseModel):
    orgName: str
    role: str
    email: str
    region: str

@app.get("/")
def root():
    return {"ok": True, "service": "BC backend in Codespaces"}

@app.post("/register")
def register(p: Registration):
    return {"ok": True, "id": "reg-" + p.orgName.lower().replace(" ", "-")}

@app.post("/requests")
def create_request(payload: dict):
    return {"ok": True, "id": "REQ-12345"}

@app.get("/requests/{rid}/matches")
def matches(rid: str):
    return [
        {"providerName": "GreenWheels Logistics","providerRole":"carrier","score":92,"capacityOK":True,"priceEstimate":1750,"leadTimeHrs":20,"co2EstimateKg":88}
    ]

@app.post("/contracts/draft")
def draft_contract(payload: dict):
    return {
        "id": "SC-abc",
        "requestId": payload.get("requestId", "REQ-12345"),
        "parties": [payload.get("partyA", "A"), payload.get("partyB", "B")],
        "status": "DRAFT",
        "onTimeReward": "2% collateral back + fee release",
        "tardyPenalty": "Collateral slashed 60% + penalty 5%",
        "terms": [
            {"key":"Delivery Deadline", "value":"2025-12-01T00:00:00Z"},
            {"key":"Payment Option", "value":"Token or Fiat"},
            {"key":"Lead Time Target (hrs)", "value":24},
            {"key":"CO2 Budget (kg)", "value":120}
        ]
    }

@app.post("/contracts/{cid}/deploy")
def deploy(cid: str):
    return {"ok": True, "tx": "0xdeadbeef"}

@app.get("/tracking")
def tracking(requestId: str):
    return [
        {"tsISO":"2025-09-22T08:00:00Z","status":"Picked up","location":"Kelowna DC"},
        {"tsISO":"2025-09-22T12:00:00Z","status":"In transit","location":"Kamloops"}
    ]
