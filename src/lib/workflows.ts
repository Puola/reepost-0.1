import { db } from './firebase';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useAuth } from './auth';

export interface Workflow {
  id?: string;
  title: string;
  reposts: number;
  author: string;
  platforms: {
    from: string;
    to: string[];
  };
  isAuto: boolean;
  userId: string;
  createdAt: Date;
  videoFormat?: 'vertical' | 'horizontal';
  videoDuration?: 'default' | 'short' | 'long';
}

export async function createWorkflow(workflow: Omit<Workflow, 'id' | 'createdAt'>) {
  try {
    const docRef = await addDoc(collection(db, 'workflows'), {
      ...workflow,
      createdAt: new Date(),
      reposts: workflow.reposts || 0
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating workflow:', error);
    throw error;
  }
}

export async function deleteWorkflow(workflowId: string) {
  try {
    await deleteDoc(doc(db, 'workflows', workflowId));
  } catch (error) {
    console.error('Error deleting workflow:', error);
    throw error;
  }
}

export async function updateWorkflow(workflowId: string, data: Partial<Workflow>) {
  try {
    const workflowRef = doc(db, 'workflows', workflowId);
    await updateDoc(workflowRef, data);
  } catch (error) {
    console.error('Error updating workflow:', error);
    throw error;
  }
}

export async function duplicateWorkflow(workflowId: string) {
  try {
    // Get the original workflow
    const workflowDoc = await getDoc(doc(db, 'workflows', workflowId));
    if (!workflowDoc.exists()) {
      throw new Error('Workflow not found');
    }

    const originalWorkflow = workflowDoc.data() as Workflow;
    
    // Create new workflow with copied data
    const duplicatedWorkflow = {
      ...originalWorkflow,
      title: `${originalWorkflow.title} (copie)`,
      reposts: 0,
      createdAt: new Date()
    };

    // Add the duplicated workflow to Firestore
    const docRef = await addDoc(collection(db, 'workflows'), duplicatedWorkflow);
    return docRef.id;
  } catch (error) {
    console.error('Error duplicating workflow:', error);
    throw error;
  }
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for user's workflows
    const workflowsRef = collection(db, 'workflows');
    const q = query(
      workflowsRef, 
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const userWorkflows = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) as Workflow[];

        setWorkflows(userWorkflows);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching workflows:', error);
        setWorkflows([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  return { workflows, loading };
}