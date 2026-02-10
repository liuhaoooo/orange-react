
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2, RefreshCcw } from 'lucide-react';
import * as d3 from 'd3';
import { fetchTopologyData, fetchStatusInfo } from '../../utils/api';
import { useLanguage } from '../../utils/i18nContext';
import { useAlert } from '../../utils/AlertContext';
import { useGlobalState } from '../../utils/GlobalStateContext';
import cloudIcon from '../../assets/cloud.png';
import routerIcon from '../../assets/router.png';
import deviceIcon from '../../assets/network_device.png';
import wifiIcon from '../../assets/wifi.png';
import portIcon from '../../assets/network_port.png';
import successIcon from '../../assets/success.png';
import errorIcon from '../../assets/error.png';

// --- Icons ---
const CLOUD_ICON = cloudIcon;
const ROUTER_ICON = routerIcon;
const DEVICE_ICON = deviceIcon;
const WIFI_ICON = wifiIcon;
const PORT_ICON = portIcon;
const SUCCESS_ICON = successIcon;
const ERROR_ICON = errorIcon;

// --- Data Processing Functions ---

const u_formatMAC = (mac: string) => {
    if(!mac) return "";
    return mac.toUpperCase();
}

const getMacLastFour = (macAddress: string) => {
  if (!macAddress) return '';
  return macAddress.slice(-5)?.replace(/:/g, '').toUpperCase();
};

const get_dev_role_string = (devRole: string) => {
  switch (parseInt(devRole)) {
    case 1: return "Controller";
    case 2: return "Agent";
    case 3: return "Controller";
    default: return "Not Configured";
  }
};

const get_uplink_tree_info = (tree_info: any[], mac: string) => {
  for (let nIdx = 0; nIdx < tree_info.length; nIdx++) {
    if (tree_info[nIdx]["alMac"] == mac) {
      let str = `"name":"${tree_info[nIdx]['devRole']}","mac":"${tree_info[nIdx]['alMac']}"`;
      if(tree_info[nIdx]['ip']){
        str += `,"ip":"${tree_info[nIdx]['ip']}"`;
      }
      if(tree_info[nIdx]['hostname'] && tree_info[nIdx]['hostname'] != '*'){
        str += `,"hostname":"${tree_info[nIdx]['hostname']}"`;
      }
      str += ',';
      return str;
    }
  }
  return "";
};

const buildHierarchy = (arr: any[]) => {
  let rootItem = arr.filter((item) => item.name == "Controller")[0];
  if (!rootItem) {
    rootItem = arr.filter((item) => item.name == "Agent")[0];
  }
  if (!rootItem && arr.length > 0) rootItem = arr[0]; // Fallback
  if (!rootItem) return null;

  const findNode = (currentItem: any) => {
    let node = { ...currentItem };
    node.children = [];
    const children =
      arr.filter((item) => item?.mac == currentItem?.mac)[0]?.children || [];
    for (const child of children) {
      const childNode = findNode(child);
      node.children.push(childNode);
    }
    return node;
  };
  return findNode(rootItem);
};

const disp_topology_vis = (tree_info: any[]) => {
  let str = "",
    numStaPerDev = 0;
  for (let nIdx = 0; nIdx < tree_info.length; nIdx++) {
    if (tree_info[nIdx]["devRole"] == "Agent") {
      let upLinkNodeStr = get_uplink_tree_info(
        tree_info,
        tree_info[nIdx]["UplinkAlMac"]
      );
      if (upLinkNodeStr) {
        str += `{"children":[{"name":"${tree_info[nIdx]["devRole"]}","mac":"${tree_info[nIdx]["alMac"]}"`;
        if (tree_info[nIdx]["medium"]) {
          str += `,"linkType":"${tree_info[nIdx]["medium"]}"`;
        }
        if (tree_info[nIdx]["ip"]) {
          str += `,"ip":"${tree_info[nIdx]["ip"]}"`;
        }
        if(tree_info[nIdx]['hostname'] && tree_info[nIdx]['hostname'] != '*'){
          str += `,"hostname":"${tree_info[nIdx]['hostname']}"`
        }
        str += `}],${upLinkNodeStr}`;
      }
    }
    // --------wifi
    for (let ssid in tree_info[nIdx]["wifistaInfo"]) {
      for (
        let staIdx = 0;
        staIdx < tree_info[nIdx]["wifistaInfo"][ssid].length;
        staIdx++
      ) {
        if (
          tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["staIsBh"] == "Yes" &&
          tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["medium"] != "Ethernet"
        ) {
          continue;
        }
        str += `{"children":[{"name":"STA","mac":"${tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["staMac"]}","ssid":"${ssid}","linkType":"${tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["medium"]}"`;
        if (tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["ip"]) {
          str += `,"ip":"${tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["ip"]}"`;
        }
        if (
          tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["hostname"] &&
          tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["hostname"] != "*"
        ) {
          str += `,"hostname":"${tree_info[nIdx]["wifistaInfo"][ssid][staIdx]["hostname"]}"`;
        }
        str += `}],"name":"${tree_info[nIdx]["devRole"]}","mac":"${tree_info[nIdx]["alMac"]}"`;
        if (tree_info[nIdx]["devRole"] == "Agent") {
          if (tree_info[nIdx]["medium"]) {
            str += `,"linkType":"${tree_info[nIdx]["medium"]}"`;
          }
          if (tree_info[nIdx]["ip"]) {
            str += `,"ip":"${tree_info[nIdx]["ip"]}"`;
          }
          if(tree_info[nIdx]['hostname'] && tree_info[nIdx]['hostname'] != '*'){
            str += `,"hostname":"${tree_info[nIdx]['hostname']}"`
          }
        }
        str += "},";
        numStaPerDev++;
      }
    }
    // --------有线
    for (let medium in tree_info[nIdx]["ethstaInfo"]) {
      for (
        let ethstaIdx = 0;
        ethstaIdx < tree_info[nIdx]["ethstaInfo"][medium].length;
        ethstaIdx++
      ) {
        str += `{"children":[{"name":"STA","mac":"${tree_info[nIdx]["ethstaInfo"][medium][ethstaIdx]["mac"]}","linkType":"${medium}"`;
        if (tree_info[nIdx]["ethstaInfo"][medium][ethstaIdx]["ip"]) {
          str += `,"ip":"${tree_info[nIdx]["ethstaInfo"][medium][ethstaIdx]["ip"]}"`;
        }
        if (
          tree_info[nIdx]["ethstaInfo"][medium][ethstaIdx]["hostname"] &&
          tree_info[nIdx]["ethstaInfo"][medium][ethstaIdx]["hostname"] != "*"
        ) {
          str += `,"hostname":"${tree_info[nIdx]["ethstaInfo"][medium][ethstaIdx]["hostname"]}"`;
        }
        str += `}],"name":"${tree_info[nIdx]["devRole"]}","mac":"${tree_info[nIdx]["alMac"]}"`;
        if (tree_info[nIdx]["devRole"] == "Agent") {
          if (tree_info[nIdx]["medium"]) {
            str += `,"linkType":"${tree_info[nIdx]["medium"]}"`;
          }
          if (tree_info[nIdx]["ip"]) {
            str += `,"ip":"${tree_info[nIdx]["ip"]}"`;
          }
          if(tree_info[nIdx]['hostname'] && tree_info[nIdx]['hostname'] != '*'){
            str += `,"hostname":"${tree_info[nIdx]['hostname']}"`
          }
        }
        str += "},";
        numStaPerDev++;
      }
    }
    //-----------Controller、Agent
    if (
      numStaPerDev == 0 &&
      tree_info.length == 1 &&
      (tree_info[nIdx]["devRole"] == "Controller" ||
        tree_info[nIdx]["devRole"] == "Agent")
    ) {
      str += `{"name":"${tree_info[nIdx]['devRole']}","mac":"${tree_info[nIdx]['alMac']}"},`;
    }
  }
  if (str && str.charAt(str.length - 1) === ",") {
    str = str.slice(0, -1);
  }
  let resArr = `{"arr":[${str}]}`;
  try {
    return JSON.parse(resArr);
  } catch (error) {
    return { arr: [] };
  }
}

export const DataHandle_createData = (topologyInformation: string, dhcpList: any[] = [], alMac: string = "") => {
  // Sanitize non-standard JSON string
  let sanitized = topologyInformation.replace(/'/g, '"');
  // Handle Python-like None/True/False if present (optional but safe)
  sanitized = sanitized.replace(/None/g, 'null').replace(/True/g, 'true').replace(/False/g, 'false');
  // Replaced replaceAll with replace(/.../g, ...) for older TS lib compatibility
  sanitized = sanitized.replace(/Pass-phrase/g, "WPAPSK");
  
  let topoData: any;
  try {
      topoData = JSON.parse(sanitized)["topology information"];
  } catch(e) {
      console.error("Failed to parse topology JSON", e);
      return { treeData: null, maclist: [] };
  }

  let nodeArr = [], maclist = [];
  let localHostMac = alMac;
  
  for (let i = 0; i < topoData.length; i++) {
    let dev1905Obj = topoData[i];
    let node: any = {};
    if(i == 0 && !alMac) localHostMac = dev1905Obj['AL MAC'];
    node["devRole"] = get_dev_role_string(dev1905Obj["Device role"]);
    node["alMac"] = dev1905Obj["AL MAC"];
    const obj = dhcpList.filter(
      (item) => node["alMac"].toUpperCase() === item.mac.toUpperCase()
    )[0];
    if (obj) {
      node["ip"] = obj.ip;
      node["hostname"] = obj.hostname;
      node["interface"] = obj.interface;
    } else {
      node["ip"] = dev1905Obj["BH Info"]?.[0]?.ip || ""
    }
    node["hopCount"] = parseInt(dev1905Obj["Distance from controller"]);
    node["UplinkAlMac"] = dev1905Obj["Upstream 1905 device"];
    node["wifistaInfo"] = {};
    node["ethstaInfo"] = {};
    maclist.push(dev1905Obj["AL MAC"]);

    if (dev1905Obj["BH Info"].length > 0) {
      if (dev1905Obj["BH Info"][0].hasOwnProperty("Backhaul Medium Type")) {
        node["medium"] = dev1905Obj["BH Info"][0]["Backhaul Medium Type"];
      }
    }

    for (let radIdx = 0; radIdx < dev1905Obj["Radio Info"].length; radIdx++) {
      for (
        let bssIdx = 0;
        bssIdx < dev1905Obj["Radio Info"][radIdx]["BSSINFO"].length;
        bssIdx++
      ) {
        const hasBhMac = dev1905Obj["BH Interface(AP)"]?.filter((item: any) => item && item["MAC address"] == dev1905Obj["Radio Info"][radIdx]["BSSINFO"][bssIdx]["BSSID"])[0]
        if(hasBhMac) continue
        if (
          Object.prototype.hasOwnProperty.call(
            dev1905Obj["Radio Info"][radIdx]["BSSINFO"][bssIdx],
            "connected sta info"
          )
        ) {
          for (
            let staIdx = 0;
            staIdx <
            dev1905Obj["Radio Info"][radIdx]["BSSINFO"][bssIdx][
              "connected sta info"
            ].length;
            staIdx++
          ) {
            let ssid =
              dev1905Obj["Radio Info"][radIdx]["BSSINFO"][bssIdx]["SSID"];
            const staInfo =
              dev1905Obj["Radio Info"][radIdx]["BSSINFO"][bssIdx][
                "connected sta info"
              ][staIdx];
            let staMac = staInfo["MLD_MAC"] || staInfo["STA MAC address"];
            let staIsBh = staInfo["BH STA"];
            let medium = staInfo["Medium"];
            const staobj = dhcpList.filter(
              (item) => staMac.toUpperCase() === item.mac.toUpperCase()
            )[0];
            let ip, hostname, interface_;
            if (staobj) {
              ip = staobj.ip;
              hostname = staobj.hostname;
              interface_ = staobj.interface;
            }
            if (
              Object.prototype.hasOwnProperty.call(node["wifistaInfo"], ssid)
            ) {
              node["wifistaInfo"][ssid].push({
                staMac: staMac,
                staIsBh: staIsBh,
                ip: ip,
                hostname: hostname,
                interface: interface_,
                medium: medium,
              });
            } else {
              node["wifistaInfo"][ssid] = Array({
                staMac: staMac,
                staIsBh: staIsBh,
                ip: ip,
                hostname: hostname,
                interface: interface_,
                medium: medium,
              });
            }
          }
        }
      }
    }

    for (
      let cliIdex = 0;
      cliIdex < dev1905Obj["Other Clients Info"].length;
      cliIdex++
    ) {
      if (
        Object.prototype.hasOwnProperty.call(
          dev1905Obj["Other Clients Info"][cliIdex],
          "Client Address"
        )
      ) {
        let cliAdd =
          dev1905Obj["Other Clients Info"][cliIdex]["Client Address"];
        let medium = dev1905Obj["Other Clients Info"][cliIdex]["Medium"];
        const staobj = dhcpList.filter(
          (item) => cliAdd.toUpperCase() === item.mac.toUpperCase()
        )[0];
        let ip, hostname, interface_;
        if (staobj) {
          ip = staobj.ip;
          hostname = staobj.hostname;
          interface_ = staobj.interface;
        }
        if (Object.prototype.hasOwnProperty.call(node["ethstaInfo"], medium)) {
          node["ethstaInfo"][medium].push({
            mac: cliAdd,
            ip: ip,
            hostname: hostname,
            interface: interface_,
          });
        } else {
          node["ethstaInfo"][medium] = Array({
            mac: cliAdd,
            ip: ip,
            hostname: hostname,
            interface: interface_,
          });
        }
      }
    }
    nodeArr.push(node);
  }
  let resArr = disp_topology_vis(nodeArr);
  const mergedArr = resArr.arr.reduce((acc: any[], curr: any) => {
    const existingItem = acc.find((item) => item.mac === curr.mac);
    if (existingItem) {
      existingItem.children.push(...curr.children);
    } else {
      acc.push(curr);
    }
    return acc;
  }, []);
  let treeData = buildHierarchy(mergedArr);
  return {
    treeData,
    maclist,
    localHostMac
  };
};

export const TopologyDiagramPage: React.FC = () => {
    const { t } = useLanguage();
    const { showAlert } = useAlert();
    const { globalData } = useGlobalState();
    const svgRef = useRef<SVGSVGElement>(null);
    const [loading, setLoading] = useState(true);
    const [treeData, setTreeData] = useState<any>(null);
    const [localHostMac, setLocalHostMac] = useState("");
    const [networkState, setNetworkState] = useState("1"); // 1/3 connected, 2/4 disconnected

    const nsMap: Record<string, string> = {
        "1": `${t("dataIs")} ${t("on")} (${t("connected")})`,
        "2": `${t("dataIs")} ${t("on")} (${t("notConnected")})`,
        "3": `${t("dataIs")} ${t("on")} (${t("connected")})`, // Fallback for cellular
        "4": `${t("dataIs")} ${t("on")} (${t("notConnected")})`
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Status for DHCP list and connection status
            const statusRes = await fetchStatusInfo();
            const dhcpList: any[] = (statusRes && Array.isArray(statusRes.dhcp_list_info)) ? statusRes.dhcp_list_info : [];
            setNetworkState(statusRes?.network_status || "2"); // Default to not connected

            // Fetch Topology
            const topoRes = await fetchTopologyData();
            if (topoRes && topoRes.tuopuData) {
                const processed = DataHandle_createData(topoRes.tuopuData, dhcpList);
                setTreeData(processed.treeData);
                if(processed.localHostMac) setLocalHostMac(processed.localHostMac);
            } else {
                showAlert("No topology data available", "info");
            }
        } catch (e) {
            console.error(e);
            showAlert("Failed to load topology", "error");
        } finally {
            setLoading(false);
        }
    }, [showAlert, t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useEffect(() => {
        if (!treeData || !svgRef.current) return;

        // --- D3 Rendering Logic ---
        const renderTopology = (data: any) => {
            const dashMac = data.mac;
            // Wrap in cloud node
            const rootData = {
                name: "Internet",
                cloud: true,
                children: [data]
            };

            // Clear previous
            d3.select(svgRef.current).selectAll("#gGroup").remove();

            const svg = d3.select(svgRef.current);
            const margin = { top: 50, right: 50, bottom: 100, left: 50 };
            const g = svg.append("g").attr("id", "gGroup");
            
            const foreignObjectLayer = g.append("g")
                .attr("class", "foreign-object-layer")
                .raise();

            const zoom = d3.zoom().scaleExtent([0.5, 1.2]);
            svg.call(
                zoom.on("zoom", (e) => {
                    const width = svg.node()?.getBoundingClientRect().width || 0;
                    const height = svg.node()?.getBoundingClientRect().height || 0;
                    const gGroupNode = d3.select("g#gGroup").node() as SVGGraphicsElement;
                    const gGroupBBox = gGroupNode.getBBox();
                    const transform = e.transform;
                    // Simple constraint
                    g.attr("transform", transform.toString());
                    foreignObjectLayer.raise();
                })
            );

            // Initial center
            const svgWidth = svg.node()?.getBoundingClientRect().width || 0;
            // @ts-ignore
            svg.transition().duration(0).call(zoom.transform, d3.zoomIdentity.translate(svgWidth / 2, margin.top).scale(0.7));

            // Create tree layout
            const hierarchy = d3.hierarchy(rootData);
            const treeLayout = d3.tree().nodeSize([200, 230]);
            const root = treeLayout(hierarchy);

            // Links
            g.selectAll(".link")
                .data(root.links())
                .join("g")
                .attr("class", "link")
                .append("path")
                .attr("fill", "none")
                .attr("stroke-width", "2px")
                .attr("stroke", "#666")
                .attr("d", (d: any) => {
                     const sX = d.source.x, sY = d.source.y + 120;
                     const tX = d.target.x, tY = d.target.y - 20;
                     return `M${sX},${sY}V${(tY-sY)/4 + sY}H${tX}V${tY}`;
                })
                .attr("stroke-dasharray", (d: any) => d.target.data.mac == dashMac ? "5,5" : "0,0");

            // Nodes
            const nodes = g.selectAll(".node")
                .data(root.descendants())
                .join("g")
                .attr("class", "node")
                .attr("id", (d: any) => d.data.name);

            // Rect background
            nodes.append("rect")
                .attr("class", "toolTipClick cursor-pointer")
                .attr("x", (d: any) => d.x - 65)
                .attr("y", (d: any) => d.y)
                .attr("width", 130)
                .attr("height", 100)
                .attr("rx", 8)
                .attr("ry", 8)
                .attr("fill", (d: any) => d.data.cloud ? "transparent" : "#adc2df");

            // Badge count
            nodes.append("rect")
                .attr("class", "toolTipClick cursor-pointer")
                .attr("x", (d: any) => d.x + 35)
                .attr("y", (d: any) => d.y + 70)
                .attr("width", 30)
                .attr("height", 30)
                .attr("rx", 14)
                .attr("ry", 14)
                .attr("fill", (d: any) => (d.data.children && d.data.children.length > 0 && !d.data.cloud) ? "#95d475" : "transparent");
            
            nodes.append("text")
                .attr("class", "toolTipClick cursor-pointer")
                .text((d: any) => d.data.children && d.data.children.length > 0 && !d.data.cloud ? d.data.children.length : "")
                .attr("x", (d: any) => d.x + 50)
                .attr("y", (d: any) => d.y + 90)
                .attr("text-anchor", "middle")
                .style("fill", "#fff")
                .style("font-size", "12px")
                .style("font-weight", "bold");

            // Icons
            nodes.append("image")
                .attr("href", (d: any) => {
                    if (d.data.cloud) return CLOUD_ICON;
                    if (d.data.name === "STA") return DEVICE_ICON;
                    return ROUTER_ICON;
                })
                .attr("class", "node-img toolTipClick cursor-pointer")
                .attr("x", (d: any) => d.data.cloud ? d.x - 32 : d.x - 32)
                .attr("y", (d: any) => d.data.cloud ? d.y + 10 : d.y + 15)
                .attr("width", 64)
                .attr("height", 64);

            // Cloud Label
            nodes.append("text")
                .text((d: any) => d.data.cloud ? "Internet" : "")
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y + 80)
                .style("fill", "#000")
                .style("font-size", "14px")
                .attr("text-anchor", "middle");

            // Connection Icon (Wifi/Port)
            nodes.append("image")
                .attr("href", (d: any) => {
                    if (["2.4G", "5G", "6G"].includes(d.data.linkType)) return WIFI_ICON;
                    if (d.data.linkType === "Ethernet") return PORT_ICON;
                    return null;
                })
                .attr("x", (d: any) => d.x - 12)
                .attr("y", (d: any) => d.y - 34)
                .attr("width", 24)
                .attr("height", 24);

            // Status Icon (Success/Error) for Cloud
            nodes.append("image")
                .attr("href", (d: any) => {
                    if (!d.data.cloud) return null;
                    return (networkState === '1' || networkState === '3') ? SUCCESS_ICON : ERROR_ICON;
                })
                .attr("x", (d: any) => d.x - 12)
                .attr("y", (d: any) => d.y + 120)
                .attr("width", 24)
                .attr("height", 24);
            
            nodes.append("text")
                .text((d: any) => d.data.cloud ? nsMap[networkState] : "")
                .attr("x", (d: any) => d.x)
                .attr("y", (d: any) => d.y + 160)
                .style("fill", (networkState === '1' || networkState === '3') ? "green" : "red")
                .style("font-size", "12px")
                .attr("text-anchor", "middle");

            // Hostname Label
            nodes.append("text")
                .text((d: any) => {
                    if(d.data.cloud) return "";
                    if(d.data.mac && localHostMac && d.data.mac.toUpperCase() == localHostMac.toUpperCase()) 
                        return d.data.hostname || (globalData.connectionSettings?.board_type || "Router");
                    return d.data.hostname ? (d.data.hostname + '_' + getMacLastFour(d.data.mac)) : getMacLastFour(d.data.mac);
                })
                .attr("x", (d: any) => d.x)
                .attr("y", (d) => d.y + 116)
                .attr("text-anchor", "middle")
                .style("fill", "#2b6afd")
                .style("font-size", "14px");

            // Tooltips (ForeignObject)
            const titleData = (data: any) => {
                let linkType = "";
                if (["2.4G", "5G", "6G"].includes(data.linkType)) linkType = `(Wi-Fi [${data.linkType}])`;
                if (data.linkType === "Ethernet") linkType = `(Wired)`;
                
                let lines = [];
                lines.push(`<b>${data.name}</b> ${linkType}`);
                if(data.ip) lines.push(`IP: ${data.ip}`);
                if(data.mac) lines.push(`MAC: ${u_formatMAC(data.mac)}`);
                if(data.ssid && data.name !== "Agent") lines.push(`SSID: ${data.ssid}`);
                return lines.join("<br/>");
            };

            const tooltips = foreignObjectLayer.selectAll(".foreign-object")
                .data(root.descendants().filter((d:any) => !d.data.cloud))
                .join("foreignObject")
                .attr("class", "foreign-object")
                .attr("x", (d: any) => d.x + 10)
                .attr("y", (d: any) => d.y + 50)
                .attr("width", 200)
                .attr("height", 100)
                .style("display", "none")
                .style("pointer-events", "none"); // Let clicks pass through if needed, but here we toggle on click
            
            tooltips.append("xhtml:div")
                .style("background-color", "#fff")
                .style("padding", "8px")
                .style("border", "1px solid #ccc")
                .style("border-radius", "4px")
                .style("font-size", "12px")
                .style("color", "#333")
                .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
                .html((d: any) => titleData(d.data));

            // Interaction
            g.selectAll(".toolTipClick")
                .on("click", function(event, d: any) {
                    event.stopPropagation();
                    // Hide all tooltips first
                    tooltips.style("display", "none");
                    // Show specific tooltip
                    if (!d.data.cloud) {
                        const tooltip = tooltips.filter((td: any) => td === d);
                        tooltip.style("display", "block");
                    }
                });

            // Click background to hide tooltips
            svg.on("click", () => {
                 tooltips.style("display", "none");
            });

        };

        renderTopology(treeData);

    }, [treeData, localHostMac, networkState, globalData.connectionSettings, t]);


    if (loading) {
        return (
            <div className="w-full h-96 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-orange mb-4" size={40} />
                <p className="text-gray-500 font-bold">Generating Topology...</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in py-2">
            <div className="flex justify-between items-center mb-4 px-4">
                <h3 className="font-bold text-lg text-black">Network Topology</h3>
                <button 
                    onClick={loadData}
                    className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors text-sm font-bold"
                >
                    <RefreshCcw size={16} />
                    <span>Refresh</span>
                </button>
            </div>
            
            <div className="w-full h-[600px] border border-gray-200 rounded-lg bg-[#f9f9f9] overflow-hidden relative">
                <svg ref={svgRef} id="mainsvg" width="100%" height="100%" className="cursor-move"></svg>
            </div>
        </div>
    );
};
