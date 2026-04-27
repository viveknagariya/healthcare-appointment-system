import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useEncryptedStorage, passwordEncrypted } from "./useEncryptedStorage";

function ProtectedRoute({ children, allowedRoles = [] }) {
    const { load } = useEncryptedStorage("secureData");

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [checking, setChecking] = useState(true); 

    useEffect(() => {
        const checkAuthorization = async () => {
            try {
                const userData = await load(passwordEncrypted);

                if (
                    userData &&
                    (allowedRoles.length === 0 || allowedRoles.includes(userData.role))
                ) {
                    setIsAuthorized(true);
                } else {
                    setIsAuthorized(false);
                }
            } catch (e) {
                setIsAuthorized(false);
            } finally {
                setChecking(false); 
            }
        };

        checkAuthorization();
    }, [allowedRoles, load]);

    
    if (checking) return <div></div>;

    return isAuthorized ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
