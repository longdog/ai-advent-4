#!/usr/bin/env bash

set -euo pipefail

# Set DBUS_SESSION_BUS_ADDRESS if not set
export DBUS_SESSION_BUS_ADDRESS="${DBUS_SESSION_BUS_ADDRESS:-unix:path=/run/user/$(id -u)/bus}"

while read -r line; do
    # Parse JSON input using jq
    method=$(echo "$line" | jq -r '.method' 2>/dev/null)
    id=$(echo "$line" | jq -r '.id' 2>/dev/null)
    if [[ "$method" == "initialize" ]]; then
        echo '{"jsonrpc":"2.0","id":'"$id"',"result":{"protocolVersion":"2024-11-05","capabilities":{"experimental":{},"prompts":{"listChanged":false},"resources":{"subscribe":false,"listChanged":false},"tools":{"listChanged":false}},"serverInfo":{"name":"notification","version":"0.0.1"}}}'
    
    elif [[ "$method" == "notifications/initialized" ]]; then
        : #do nothing
    
    elif [[ "$method" == "tools/list" ]]; then
        echo '{"jsonrpc":"2.0","id":'"$id"',"result":{"tools":[{"name":"show","description":"show notification with title and message.\n\nArgs:\n    title, message\n","inputSchema":{"properties":{"title":{"title":"title","type":"string"},"message":{"title":"message","type":"string"}},"required":["title", "message"],"type":"object"}}]}}'
    
    elif [[ "$method" == "resources/list" ]]; then
        echo '{"jsonrpc":"2.0","id":'"$id"',"result":{"resources":[]}}'

    elif [[ "$method" == "prompts/list" ]]; then
        echo '{"jsonrpc":"2.0","id":'"$id"',"result":{"prompts":[]}}'

    elif [[ "$method" == "tools/call" ]]; then
        tool_method=$(echo "$line" | jq -r '.params.name' 2>/dev/null)
        title=$(echo "$line" | jq -r '.params.arguments.title' 2>/dev/null)
        message=$(echo "$line" | jq -r '.params.arguments.message' 2>/dev/null)
        notify-send "$title" "$message"
        echo '{"jsonrpc":"2.0","id":'"$id"',"result":{"content":[],"isError":false}}'
    
    else
        echo '{"jsonrpc":"2.0","id":'"$id"',"error":{"code":-32601,"message":"Method not found"}}'
    fi
done || break