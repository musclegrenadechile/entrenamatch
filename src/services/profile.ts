// ✅ Función para limpiar 'undefined' antes de guardar en Firestore
const cleanForFirestore = (data: any): any => {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item));
  }
  
  if (typeof data === 'object') {
    const cleaned: any = {};
    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        cleaned[key] = cleanForFirestore(data[key]);
      }
      // Si es undefined, simplemente NO se incluye (Firestore lo prefiere)
    });
    return cleaned;
  }
  
  return data;
};