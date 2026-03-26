// src/authProvider.ts
import { AuthProvider } from 'react-admin';
import { getIdToken } from 'firebase/auth';
import { auth } from '../auth/firebase';
import {setServerStatus} from '../services/serverStatus'




const authProvider: AuthProvider = {
    
    login: async () => {
        const user = auth.currentUser;
  
        if (!user) throw new Error("Usuário não autenticado no Firebase");

        const token = await getIdToken(user);
        localStorage.setItem('token', token);

        // Chamada opcional para o backend se quiser validar e pegar roles/permissões
        const response = await fetch('http://localhost:3000/units/my-permissions', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await response.json(); 

        
	
        localStorage.setItem('permissions', JSON.stringify(data || []));
        
        if (!Array.isArray(data) ) {
            return Promise.reject(new Error("Sem permissões válidas"));
        }
        return;
    },
    logout: () => {
    
        localStorage.removeItem('token');
        localStorage.removeItem('permissions');
        localStorage.removeItem('active_permission');
        localStorage.removeItem('NomeEmpresa');
        
       

        auth.signOut();
        return Promise.resolve();
    },
    checkAuth: () => {
     
        return localStorage.getItem('token') ? Promise.resolve() : Promise.reject();
    },
    checkError: (error) => {
      
      

         if (!error.status) {
        // erro de rede ou servidor não respondeu
      
            setServerStatus(false); 
            //return Promise.reject(error);
        }

        if (error.status === 401) {
            // Token inválido/expirado => desloga
 
            localStorage.removeItem('token');
            return Promise.reject();
        }

        if (error.status === 403) {
            // Usuário autenticado, mas sem permissão para a rota
            // NÃO remove token => apenas bloqueia a ação no react-admin
            return Promise.resolve();
        }

        return Promise.resolve();
    },
    getPermissions: () => {
        const active = localStorage.getItem("active_permission");
        return active ? Promise.resolve(JSON.parse(active)) : Promise.resolve(null);
    },
    removeActivePermission: () => {
        localStorage.removeItem("active_permission");
    },
    setActivePermission: (perm: any) => {
     localStorage.setItem("active_permission", JSON.stringify([perm]));
    },

    getActivePermission: () => {
        const perm = localStorage.getItem("active_permission");
        return perm ? JSON.parse(perm) : null;
    },

    getAllPermissions: () => {
        const perms = localStorage.getItem("permissions");
        return perms ? JSON.parse(perms) : [];
    },
    getIdentity: async () => {
        const user = auth.currentUser;
   
        if (!user) return Promise.reject();
    
        return {
            id: user?.uid,
            fullName: user?.displayName || "",  
            avatar: user?.photoURL || "", 
        };

         
    }
};

export default authProvider;
