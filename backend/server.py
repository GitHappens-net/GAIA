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
        "sprinkler_status": False,
    },
    2: {
        "node_id": 2,
        "temp": 24.1,
        "humidity": 72,
        "moisture": 38,
        "Nlevel": 7.5,
        "Plevel": 4.8,
        "Klevel": 5.9,
        "sprinkler_status": True,
    },
}

# ------------------------------
# Node API
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

    # Analyze percipitation and command sprinkler
    sprinkler_status = analyze_moisture(temp, humidity, moisture)

    # Analyze nutrients and command mixer
    status = analyze_nutrients(Nlevel, Plevel, Klevel)
    print(f"Node {node_id} nutrients status: {status}")

    # Write gathered data
    nodes[node_id] = {
        "node_id":          node_id,
        "temp":             temp,
        "humidity":         humidity,
        "moisture":         moisture,
        "Nlevel":           Nlevel,
        "Plevel":           Plevel,
        "Klevel":           Klevel,
        "sprinkler_status": sprinkler_status,
    }

    # Return sprinkler command
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

    nodes[node_id]["sprinkler_status"] = bool(body["sprinkler_status"])
    return jsonify({"ok": True, "node_id": node_id, "sprinkler_status": nodes[node_id]["sprinkler_status"]})

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
