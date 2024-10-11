import {currentDate} from "@/services/common.js";

export const configMapTemplateReader = ({ name = 'config-' + currentDate(),labels={}, namespace='default', data={}, binaryData={}}) => {
    return {
        "apiVersion": "v1",
        "binaryData": binaryData,
        "data": data,
        "kind": "ConfigMap",
        "metadata": {
            "labels": labels,
            "name": name,
            "namespace": namespace,
        }
    }

}

export const secretTemplateReader = ({ name = 'secret-' + currentDate(),labels={}, namespace='default', data={}, stringData={}}) => {
    return {
        "apiVersion": "v1",
        "data": data,
        "immutable": false,
        "kind": "Secret",
        "metadata": {
            "annotations": {},
            "labels": labels,
            "name": name,
            "namespace": namespace,
        },
        "stringData": stringData,
    }



}

export const deploymentJsonTemplateReader = ({name,namespace,image})=>{
    const result = {
        "apiVersion": "apps/v1",
        "kind": "Deployment",
        "metadata": {
            "name": `${name}`,
            "namespace": `${namespace}`,
            "labels": {
                "app": `${name}`
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "app": `${name}`
                }
            },
            "template": {
                "metadata": {
                    "labels": {
                        "app": `${name}`
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": `${name}`,
                            "image": `${image}`
                        }
                    ]
                }
            }
        }
    }
    return JSON.stringify(result,null,2)

}

export const statefulsetJsonTemplateReader = ({name,namespace,image})=>{
    const result = {
        "apiVersion": "apps/v1",
        "kind": "StatefulSet",
        "metadata": {
            "name": `${name}`,
            "namespace": `${namespace}`,
            "labels": {
                "app": `${name}`
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "app": `${name}`
                }
            },
            "template": {
                "metadata": {
                    "labels": {
                        "app": `${name}`
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": `${name}`,
                            "image": `${image}`
                        }
                    ]
                }
            }
        }
    }
    return JSON.stringify(result,null,2)

}

export const daemonsetJsonTemplateReader = ({name,namespace,image})=>{
    const result = {
        "apiVersion": "apps/v1",
        "kind": "DaemonSet",
        "metadata": {
            "name": `${name}`,
            "namespace": `${namespace}`,
            "labels": {
                "app": `${name}`
            }
        },
        "spec": {
            "replicas": 1,
            "selector": {
                "matchLabels": {
                    "app": `${name}`
                }
            },
            "template": {
                "metadata": {
                    "labels": {
                        "app": `${name}`
                    }
                },
                "spec": {
                    "containers": [
                        {
                            "name": `${name}`,
                            "image": `${image}`
                        }
                    ]
                }
            }
        }
    }
    return JSON.stringify(result,null,2)

}
const listToMap = (list)=>{
    const map = {};
    list.forEach(item => {
        map[item.key] = item.value
    });
    return map
}

export const serviceJsonTemplateReader = ({name,namespace,ports,selector})=>{
    // selector list to map
    const selectorMap = listToMap(selector)
    //  try to parse ports string to int
    const portsNumber = ports.map(item => {
        const port = !isNaN(parseInt(item.port)) ? parseInt(item.port) : item.port;
        const targetPort = !isNaN(parseInt(item.targetPort)) ? parseInt(item.targetPort) : item.targetPort;
        return {
            port,
            targetPort,
            protocol: item.protocol,
            name: item.name
        };
    });
    const result = {
        "apiVersion": "v1",
        "kind": "Service",
        "metadata": {
            "name": `${name}`,
            "namespace": `${namespace}`,
            "labels": {
                "app": `${name}`
            }
        },
        "spec": {
            "ports": portsNumber,
            "selector": {...selectorMap}
        }
    }
    return JSON.stringify(result,null,2)

}
