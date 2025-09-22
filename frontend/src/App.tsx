import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

async function postJSON(path: string, body: any) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
async function getJSON(path: string) {
  const res = await fetch(`${API_URL}${path}`);
  return res.json();
}

const api = {
  register: (payload: any) => postJSON("/register", payload),
  createDeliveryRequest: (payload: any) => postJSON("/requests", payload),
  findMatches: (id: string) => getJSON(`/requests/${id}/matches`),
  draftContract: (requestId: string, partyA: string, partyB: string) =>
    postJSON("/contracts/draft", { requestId, partyA, partyB }),
  deployContract: (cid: string) => postJSON(`/contracts/${cid}/deploy`, {}),
  trackingFor: (rid: string) => getJSON(`/tracking?requestId=${encodeURIComponent(rid)}`),
};

type Tab = "register" | "request" | "match" | "contract" | "tracking";

export default function App() {
  const [tab, setTab] = useState<Tab>("register");

  const [reg, setReg] = useState({ orgName: "", role: "supplier", email: "", region: "BC" });
  const [regId, setRegId] = useState<string>("");

  const [reqForm, setReqForm] = useState<any>({
    demander: "",
    fromRegion: "BC-Interior",
    toRegion: "Lower Mainland",
    materialId: "MAT-001",
    quantity: 100,
    deadlineISO: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    maxPrice: 2000,
    collateralStake: 500,
    notes: "Fragile, keep upright",
  });
  const [requestId, setRequestId] = useState<string>("");
  const [matches, setMatches] = useState<any[]>([]);
  const [contract, setContract] = useState<any>(null);
  const [tracking, setTracking] = useState<any[]>([]);

  return (
    <div style={{padding: 16, fontFamily: "system-ui"}}>
      <h1>Blockchain-enabled SDDP Supply Chain</h1>
      <div style={{display:"flex", gap:8, margin:"12px 0"}}>
        {(["register","request","match","contract","tracking"] as Tab[]).map(t => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 12px", background: tab===t?"#1a2440":"#10182a", color:"#fff", border:"1px solid #24304a", borderRadius:8}}>
            {t}
          </button>
        ))}
      </div>

      {tab==="register" && (
        <div>
          <h3>Organization Registration</h3>
          <input placeholder="Organization Name" value={reg.orgName} onChange={e=>setReg({...reg, orgName:e.target.value})}/>{" "}
          <select value={reg.role} onChange={e=>setReg({...reg, role:e.target.value})}>
            <option value="supplier">Supplier</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="depot">Depot</option>
            <option value="carrier">Fleet Carrier</option>
            <option value="demander">Demander/Retailer</option>
          </select>{" "}
          <input placeholder="Email" value={reg.email} onChange={e=>setReg({...reg, email:e.target.value})}/>{" "}
          <input placeholder="Region (e.g., BC)" value={reg.region} onChange={e=>setReg({...reg, region:e.target.value})}/>{" "}
          <button onClick={async()=>{
            const res = await api.register(reg);
            setRegId(res.id || "");
            alert("Registered: " + JSON.stringify(res));
          }}>Register</button>
          {regId && <p>Registration ID: {regId}</p>}
        </div>
      )}

      {tab==="request" && (
        <div>
          <h3>Create Delivery Request</h3>
          <input placeholder="Demander Org" value={reqForm.demander} onChange={e=>setReqForm({...reqForm, demander:e.target.value})}/>{" "}
          <input placeholder="Material ID" value={reqForm.materialId} onChange={e=>setReqForm({...reqForm, materialId:e.target.value})}/>{" "}
          <input type="number" placeholder="Quantity" value={reqForm.quantity} onChange={e=>setReqForm({...reqForm, quantity:Number(e.target.value)})}/>{" "}
          <input placeholder="Deadline ISO" value={reqForm.deadlineISO} onChange={e=>setReqForm({...reqForm, deadlineISO:e.target.value})}/>{" "}
          <input placeholder="From Region" value={reqForm.fromRegion} onChange={e=>setReqForm({...reqForm, fromRegion:e.target.value})}/>{" "}
          <input placeholder="To Region" value={reqForm.toRegion} onChange={e=>setReqForm({...reqForm, toRegion:e.target.value})}/>{" "}
          <input type="number" placeholder="Max Price" value={reqForm.maxPrice} onChange={e=>setReqForm({...reqForm, maxPrice:Number(e.target.value)})}/>{" "}
          <input type="number" placeholder="Collateral Stake" value={reqForm.collateralStake} onChange={e=>setReqForm({...reqForm, collateralStake:Number(e.target.value)})}/>{" "}
          <textarea placeholder="Notes" value={reqForm.notes} onChange={e=>setReqForm({...reqForm, notes:e.target.value})}/>{" "}
          <button onClick={async()=>{
            const res = await api.createDeliveryRequest(reqForm);
            setRequestId(res.id || "");
            alert("Request: " + JSON.stringify(res));
          }}>Submit Request</button>
          {requestId && <p>Request ID: {requestId}</p>}
        </div>
      )}

      {tab==="match" && (
        <div>
          <h3>Matching</h3>
          <input placeholder="Request ID" value={requestId} onChange={e=>setRequestId(e.target.value)}/>{" "}
          <button onClick={async()=>{
            if (!requestId) return alert("Enter Request ID");
            const m = await api.findMatches(requestId);
            setMatches(m || []);
          }}>Find Matches</button>
          <table style={{marginTop:8, width:"100%"}}>
            <thead><tr><th>Provider</th><th>Role</th><th>Score</th><th>Lead(h)</th><th>CO2(kg)</th><th>Price</th><th></th></tr></thead>
            <tbody>
              {matches.map((m:any)=>(
                <tr key={m.providerName}>
                  <td>{m.providerName}</td>
                  <td>{m.providerRole}</td>
                  <td>{m.score}</td>
                  <td>{m.leadTimeHrs}</td>
                  <td>{m.co2EstimateKg}</td>
                  <td>${m.priceEstimate}</td>
                  <td><button onClick={async()=>{
                    const draft = await api.draftContract(requestId, "DemanderOrg", m.providerName);
                    setContract(draft);
                    alert("Drafted");
                  }}>Draft Contract</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==="contract" && (
        <div>
          <h3>Contract</h3>
          {!contract && <p>Draft a contract from the Matching tab.</p>}
          {contract && (
            <div>
              <p><b>ID:</b> {contract.id} | <b>Status:</b> {contract.status}</p>
              <p><b>Request:</b> {contract.requestId}</p>
              <p><b>Parties:</b> {contract.parties?.join(" , ")}</p>
              <h4>Terms</h4>
              <ul>
                {(contract.terms || []).map((t:any)=> <li key={t.key}><b>{t.key}:</b> {String(t.value)}</li>)}
              </ul>
              <button onClick={async()=>{
                const dep = await api.deployContract(contract.id);
                alert("Deployed: " + JSON.stringify(dep));
              }}>Deploy to Chain</button>
            </div>
          )}
        </div>
      )}

      {tab==="tracking" && (
        <div>
          <h3>Tracking</h3>
          <input placeholder="Request ID" value={requestId} onChange={e=>setRequestId(e.target.value)}/>{" "}
          <button onClick={async()=>{
            if (!requestId) return alert("Enter Request ID");
            const ev = await api.trackingFor(requestId);
            setTracking(ev || []);
          }}>Load</button>
          <table style={{marginTop:8, width:"100%"}}>
            <thead><tr><th>Timestamp</th><th>Status</th><th>Location</th></tr></thead>
            <tbody>
              {tracking.map((ev:any)=>(
                <tr key={ev.tsISO}><td>{new Date(ev.tsISO).toLocaleString()}</td><td>{ev.status}</td><td>{ev.location}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
