import time
from flask import Flask, jsonify, request
from utils.analysis import analyze_moisture, analyze_nutrients

app = Flask(__name__)

nodes: dict = {
    1: {
        "node_id": 1,
        "temp": 22.5,
        "humidity": 65,
        "moisture": 45,
        "Nlevel": 8.2,
        "Plevel": 5.1,
        "Klevel": 6.3,
        "is_open": False,
        "sprinkler_status": False,
        "manual_override": None,
        "last_seen": 0,
    },
    2: {
        "node_id": 2,
        "temp": 24.1,
        "humidity": 72,
        "moisture": 38,
        "Nlevel": 7.5,
        "Plevel": 4.8,
        "Klevel": 5.9,
        "is_open": True,
        "sprinkler_status": True,
        "manual_override": None,
        "last_seen": 0,
    },
    3: {
        "node_id": 3,
        "temp": 20.3,
        "humidity": 58,
        "moisture": 52,
        "Nlevel": 7.8,
        "Plevel": 5.5,
        "Klevel": 6.1,
        "is_open": False,
        "sprinkler_status": False,
        "manual_override": None,
        "last_seen": 1,
    },
    4: {
        "node_id": 4,
        "temp": 25.7,
        "humidity": 68,
        "moisture": 42,
        "Nlevel": 8.5,
        "Plevel": 5.3,
        "Klevel": 6.8,
        "is_open": True,
        "sprinkler_status": False,
        "manual_override": None,
        "last_seen": 0,
    },
    5: {
        "node_id": 5,
        "temp": 21.9,
        "humidity": 71,
        "moisture": 48,
        "Nlevel": 7.2,
        "Plevel": 4.9,
        "Klevel": 5.7,
        "is_open": False,
        "sprinkler_status": True,
        "manual_override": True,
        "last_seen": 0,
    },
    6: {
        "node_id": 6,
        "temp": 23.4,
        "humidity": 64,
        "moisture": 41,
        "Nlevel": 8.0,
        "Plevel": 5.2,
        "Klevel": 6.4,
        "is_open": False,
        "sprinkler_status": False,
        "manual_override": None,
        "last_seen": 0,
    },
    7: {
        "node_id": 7,
        "temp": 26.2,
        "humidity": 75,
        "moisture": 35,
        "Nlevel": 8.9,
        "Plevel": 5.8,
        "Klevel": 7.1,
        "is_open": True,
        "sprinkler_status": True,
        "manual_override": None,
        "last_seen": 0,
    },
    8: {
        "node_id": 8,
        "temp": 19.8,
        "humidity": 60,
        "moisture": 55,
        "Nlevel": 6.9,
        "Plevel": 4.6,
        "Klevel": 5.4,
        "is_open": False,
        "sprinkler_status": False,
        "manual_override": None,
        "last_seen": 0,
    },
    9: {
        "node_id": 9,
        "temp": 23.6,
        "humidity": 69,
        "moisture": 46,
        "Nlevel": 7.6,
        "Plevel": 5.0,
        "Klevel": 6.2,
        "is_open": True,
        "sprinkler_status": False,
        "manual_override": False,
        "last_seen": 0,
    },
}

# ------------------------------
# Node APIstatus"] =
# ------------------------------
@app.route("/node", methods=["POST"])
def post_node():
    # Invalid JSON body
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    # Missing required fields
    required = ["node_id", "temp", "humidity", "moisture", "is_open", "Nlevel", "Plevel", "Klevel"]
    missing = [f for f in required if f not in body]
    if missing:
        return jsonify({"error": "Missing fields: " + ", ".join(missing)}), 400

    # Parse and validate fields
    node_id  = int(body["node_id"])
    temp     = float(body["temp"])
    humidity = int(body["humidity"])
    moisture = int(body["moisture"])
    Nlevel   = float(body["Nlevel"])
    Plevel   = float(body["Plevel"])
    Klevel   = float(body["Klevel"])

    # Analyze precipitation and compute auto recommendation
    auto_status = analyze_moisture(temp, humidity, moisture)

    # Analyze nutrients and command mixer
    status = analyze_nutrients(Nlevel, Plevel, Klevel)
    print(f"Node {node_id} nutrients status: {status}")

    # Manual override takes priority; fall back to auto recommendation
    manual_override = nodes.get(node_id, {}).get("manual_override", None)
    sprinkler_status = manual_override if manual_override is not None else auto_status

    # Write gathered data (is_open is just a notification from the ESP)
    nodes[node_id] = {
        "node_id":          node_id,
        "temp":             temp,
        "humidity":         humidity,
        "moisture":         moisture,
        "Nlevel":           Nlevel,
        "Plevel":           Plevel,
        "Klevel":           Klevel,
        "is_open":          bool(body["is_open"]),
        "sprinkler_status": sprinkler_status,
        "manual_override":  manual_override,
        "last_seen":        time.time(),
    }

    # Return effective sprinkler command to ESP
    return jsonify({"sprinkler_status": sprinkler_status})

@app.route("/node", methods=["GET"])
def get_node():
    # Missing node id parameter
    node_id = request.args.get("node_id")
    if node_id is None:
        return jsonify({"error": "Missing node_id query parameter"}), 400

    # Invalid node id parameter
    node = nodes.get(int(node_id))
    if node is None:
        return jsonify({"error": f"Node {node_id} not found"}), 404

    # Return sprinkler command
    return jsonify({"sprinkler_status": node["sprinkler_status"]})

# ------------------------------
# Frontend API
# ------------------------------
@app.route("/nodes", methods=["GET"])
def get_nodes():
    return jsonify(list(nodes.values()))

@app.route("/sprinkler", methods=["POST"])
def set_sprinkler():
    body = request.get_json(silent=True)
    if not body:
        return jsonify({"error": "JSON body required"}), 400

    if "node_id" not in body or "sprinkler_status" not in body:
        return jsonify({"error": "Missing fields: node_id, sprinkler_status"}), 400

    node_id = int(body["node_id"])
    if node_id not in nodes:
        return jsonify({"error": f"Node {node_id} not found"}), 404

    override = bool(body["sprinkler_status"])
    nodes[node_id]["sprinkler_status"] = override
    nodes[node_id]["manual_override"] = override
    return jsonify({"ok": True, "node_id": node_id, "sprinkler_status": override})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
