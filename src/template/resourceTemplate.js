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