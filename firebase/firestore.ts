import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    serverTimestamp,
    onSnapshot,
    type Timestamp,
    setDoc,
  } from "firebase/firestore"
  import { db } from "./config"
  
  // Generic type for Firestore data
  export type FirestoreData<T> = T & {
    id: string
    createdAt?: Timestamp
    updatedAt?: Timestamp
  }
  
  // Generic function to get a document by ID
  export async function getDocument<T>(collectionName: string, id: string): Promise<FirestoreData<T> | null> {
    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as FirestoreData<T>
      } else {
        return null
      }
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error)
      throw error
    }
  }
  
  // Generic function to get all documents from a collection
  export async function getDocuments<T>(collectionName: string): Promise<FirestoreData<T>[]> {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreData<T>[]
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error)
      throw error
    }
  }
  
  // Generic function to add a document to a collection
  export async function addDocument<T>(collectionName: string, data: T): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error(`Error adding document to ${collectionName}:`, error)
      throw error
    }
  }
  
  // Generic function to update a document
  export async function updateDocument<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error)
      throw error
    }
  }
  
  // Generic function to delete a document
  export async function deleteDocument(collectionName: string, id: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error)
      throw error
    }
  }
  
  // Generic function to set a document with a specific ID
  export async function setDocument<T>(collectionName: string, id: string, data: T): Promise<void> {
    try {
      const docRef = doc(db, collectionName, id)
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error)
      throw error
    }
  }
  
  // Generic function to query documents
  export async function queryDocuments<T>(
    collectionName: string,
    conditions: { field: string; operator: "==" | "!=" | ">" | ">=" | "<" | "<="; value: any }[],
    orderByField?: string,
    orderDirection?: "asc" | "desc",
    limitCount?: number,
  ): Promise<FirestoreData<T>[]> {
    try {
      const q = collection(db, collectionName)
  
      // Build the query with conditions
      let queryRef = query(q)
  
      // Add where clauses
      conditions.forEach((condition) => {
        queryRef = query(queryRef, where(condition.field, condition.operator, condition.value))
      })
  
      // Add orderBy if specified
      if (orderByField) {
        queryRef = query(queryRef, orderBy(orderByField, orderDirection || "asc"))
      }
  
      // Add limit if specified
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount))
      }
  
      const querySnapshot = await getDocs(queryRef)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FirestoreData<T>[]
    } catch (error) {
      console.error(`Error querying documents from ${collectionName}:`, error)
      throw error
    }
  }
  
  // Function to listen to real-time updates on a collection
  export function subscribeToCollection<T>(
    collectionName: string,
    callback: (data: FirestoreData<T>[]) => void,
    conditions?: { field: string; operator: "==" | "!=" | ">" | ">=" | "<" | "<="; value: any }[],
    orderByField?: string,
    orderDirection?: "asc" | "desc",
    limitCount?: number,
  ) {
    try {
      const q = collection(db, collectionName)
  
      // Build the query with conditions
      let queryRef = query(q)
  
      // Add where clauses if specified
      if (conditions) {
        conditions.forEach((condition) => {
          queryRef = query(queryRef, where(condition.field, condition.operator, condition.value))
        })
      }
  
      // Add orderBy if specified
      if (orderByField) {
        queryRef = query(queryRef, orderBy(orderByField, orderDirection || "asc"))
      }
  
      // Add limit if specified
      if (limitCount) {
        queryRef = query(queryRef, limit(limitCount))
      }
  
      return onSnapshot(queryRef, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as FirestoreData<T>[]
        callback(data)
      })
    } catch (error) {
      console.error(`Error subscribing to collection ${collectionName}:`, error)
      throw error
    }
  }
  
  // Function to listen to real-time updates on a document
  export function subscribeToDocument<T>(
    collectionName: string,
    id: string,
    callback: (data: FirestoreData<T> | null) => void,
  ) {
    try {
      const docRef = doc(db, collectionName, id)
      return onSnapshot(docRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          callback({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          } as FirestoreData<T>)
        } else {
          callback(null)
        }
      })
    } catch (error) {
      console.error(`Error subscribing to document ${collectionName}/${id}:`, error)
      throw error
    }
  }
  