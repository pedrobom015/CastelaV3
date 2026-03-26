// src/dataProvider.ts
import { fetchUtils, DataProvider } from "react-admin";
import simpleRestProvider from "ra-data-simple-rest";
import authProvider from "./authProvider";
import { setServerStatus } from "../services/serverStatus";

let apiUrl = "http://localhost:3000";


interface Group {
  resource: string;
  resource_server: string;
  // ... other properties
}

interface Module {
  groups: Group[];
  // ... other properties
}

interface PermissionItem {
  modules: Module[];
  // ... other properties
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo

// httpClient com retry automático
const httpClient = async (url: string, options: any = {}, retries = MAX_RETRIES) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }

  const token = localStorage.getItem("token");
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetchUtils.fetchJson(url, options);
    // Se deu certo, servidor está online
    setServerStatus(true);
    console.log("Servidor ONLINE");
    return response;
  } catch (error: any) {
    // Erro de rede
    if (!error.status && retries > 0) {
      setServerStatus(false);
      console.log(`Erro de rede, tentando novamente... (${MAX_RETRIES - retries + 1})`);
      await new Promise(res => setTimeout(res, RETRY_DELAY));
      return httpClient(url, options, retries - 1);
    }

    // Se esgotou retries ou outro erro, marca offline
    if (!error.status) {
      console.log("Servidor OFFLINE");
      
    }

    if (error.status === 401) {
      throw error;
    }

  throw new Error("Você pode estar offline ou sem permissão.");
  }
};

const baseProvider = simpleRestProvider(apiUrl, httpClient);

export const getUnitId = () => {
  const active = authProvider.getActivePermission();
  if (!active || !active[0]) {
    throw new Error("Nenhuma permissão ativa encontrada");
  }
  return active[0].system_unit_id;
};

export const getResourceServer = (resource: string) => {
  const active = authProvider.getAllPermissions();
  
  
  if (!active || !active[0]) {
    throw new Error("Nenhuma permissão ativa encontrada");
  }
  active.map((item:any)=>{
   

    item.modules.map((m:any)=>{
      
      m.groups.map((g:any)=>{
       
       if(g.resource == resource){
      
        if(g.resource_server =="castella"){
          apiUrl = "http://localhost:3000";
          apiUrl = `${apiUrl}/castella`
                
        }else{
          apiUrl = "http://localhost:3000";
        }
            
       }
        
      })
    })
   
  })
  return apiUrl;

};

export const getUnitName = () => {
  const active = authProvider.getActivePermission();
  if (!active || !active[0]) {
    throw new Error("Nenhuma permissão ativa encontrada");
  }
  return active[0].system_unit_name;
};

export const dataProvider: DataProvider = {
  ...baseProvider,

  getList: async (resource, params) => {
      const unitId = getUnitId();
      
      // Forçar valores padrão caso sort seja undefined
      const field = params.sort?.field || "id";
      const order = params.sort?.order || "ASC";
      
      const page = params.pagination?.page || 1;
      const perPage = params.pagination?.perPage || 10;
      const unitID = params.filter?.unitID;
    
      let url = "";
      const resourceServer = getResourceServer(resource);
      
      const ServerTenant = resourceServer.includes("castella")

      if(ServerTenant){
       url = `${apiUrl}/${resource}/list/?page=${page}&limit=${perPage}&sort_field=${field}&order=${order}`;
      }else{
        url = `${apiUrl}/${resource}/list?unitId=${unitId}&_page=${page}&_limit=${perPage}&_sort=${field}&_order=${order}`;

        if (unitID) {
          url += `&unitID=${unitID}`;
        }
      }
      

  
      const { json } = await httpClient(url, { method: "GET" });

      const total =  json.total ?? json.length;

      /* if(json?.data[0]?.empresa){
        localStorage.setItem('NomeEmpresa', json.data[0].empresa); 
      }
     */
      return {
          data: json.data,
          total,
      };
  },
  getMany: async (resource, params) => {
    const unitId = getUnitId();
    const url = `${apiUrl}/${resource}/list?unitId=${unitId}`;
    const response = await httpClient(url, { method: "GET" });

    const items = Array.isArray(response.json) ? response.json : response.json.data;

    const data = items
      .filter((item: any) => params.ids.includes(item.id))
      .map((item: any) => ({ ...item, id: item.id }));

    return { data };
  },

  getOne: async (resource, params) => {
    const unitId = getUnitId();
    const url = `${apiUrl}/${resource}/${params.id}?unitId=${unitId}`;
    const { json } = await httpClient(url, { method: "GET" });
    return { data: json };
  },

  create: async (resource, params) => {
    const unitId = getUnitId();
    const resourceServer = getResourceServer(resource);

    const ServerTenant = resourceServer.includes("castella")
    let url  = "";
        if(ServerTenant){
          url = `${apiUrl}/${resource}/`;
        }else{
        url =  `${apiUrl}/${resource}?unitId=${unitId}`
       }

    const { json } = await httpClient(url, {
      method: "POST",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  update: async (resource, params) => {
    const unitId = getUnitId();
    const resourceServer = getResourceServer(resource);
    const ServerTenant = resourceServer.includes("castella")
    let url  = "";
        if(ServerTenant){
          url = `${apiUrl}/${resource}/`;
        }else{
        url = `${apiUrl}/${resource}/${params.id}?unitId=${unitId}`;

       }
     
    const { json } = await httpClient(url, {
      method: "PUT",
      body: JSON.stringify(params.data),
    });
    return { data: json };
  },

  delete: async (resource, params) => {

    const unitId = getUnitId();
    const url = `${apiUrl}/${resource}/${params.id}?unitId=${unitId}`;
    const { json } = await httpClient(url, { method: "DELETE" });
    const data = json.data ? json.data : { id: params.id };
    return { data };
  },

  deleteMany: async (resource, params) => {


    const results = await Promise.all(
      params.ids.map(async (id) => {
        const unitId = getUnitId();
        const url = `${apiUrl}/${resource}/${id}?unitId=${unitId}`;
        const { json } = await httpClient(url, { method: "DELETE" });
        return json;
      })
    );
    return { data: results };
  },
};

export default dataProvider;
