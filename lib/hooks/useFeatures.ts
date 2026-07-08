import { useState, useCallback } from 'react';

// ==================== TIME TRACKING HOOK ====================
export function useTimeTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const startTracking = useCallback(() => {
    setStartTime(new Date());
    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(async (projectId: string, billable: boolean = true) => {
    if (!startTime) return null;

    const endTime = new Date();
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

    const response = await fetch('/api/features/time-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_entry',
        entry: {
          projectId,
          billable,
          startTime,
          endTime,
          durationMinutes,
          hourlyRate: 75, // Default, should be from user settings
        },
      }),
    });

    setIsTracking(false);
    setStartTime(null);
    return response.json();
  }, [startTime]);

  return { isTracking, startTime, startTracking, stopTracking };
}

// ==================== EXPENSE TRACKING HOOK ====================
export function useExpenseTracking() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);

  const addExpense = useCallback(async (projectId: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          expense: { ...data, projectId },
        }),
      });
      const result = await response.json();
      setExpenses([...expenses, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [expenses]);

  const fetchProjectExpenses = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_expenses', projectId }),
      });
      const result = await response.json();
      setExpenses(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { expenses, loading, addExpense, fetchProjectExpenses };
}

// ==================== DOCUMENT MANAGEMENT HOOK ====================
export function useDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadDocument = useCallback(async (projectId: string, file: File, docType: string) => {
    setLoading(true);
    try {
      // In real implementation, upload to Supabase Storage first
      const response = await fetch('/api/features/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          data: {
            projectId,
            title: file.name,
            fileType: docType,
            fileSize: file.size,
            fileUrl: 'https://example.com/file.pdf', // From storage
          },
        }),
      });
      const result = await response.json();
      setDocuments([...documents, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [documents]);

  const fetchProjectDocuments = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_project_docs', projectId }),
      });
      const result = await response.json();
      setDocuments(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { documents, loading, uploadDocument, fetchProjectDocuments };
}

// ==================== PHOTO GALLERY HOOK ====================
export function useProjectPhotos() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);

  const uploadPhoto = useCallback(async (projectId: string, file: File, phase: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          photo: {
            projectId,
            title: file.name,
            phase,
            imageUrl: 'https://example.com/photo.jpg',
            thumbnailUrl: 'https://example.com/thumb.jpg',
            takenAt: new Date(),
          },
        }),
      });
      const result = await response.json();
      setPhotos([...photos, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [photos]);

  const fetchPhotos = useCallback(async (projectId: string, phase?: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_photos', projectId, phase }),
      });
      const result = await response.json();
      setPhotos(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { photos, loading, uploadPhoto, fetchPhotos };
}

// ==================== PROJECT PROFITABILITY HOOK ====================
export function useProfitability() {
  const [profitability, setProfitability] = useState(null);
  const [loading, setLoading] = useState(false);

  const calculate = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/profitability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'calculate', projectId }),
      });
      const result = await response.json();
      setProfitability(result.data);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profitability, loading, calculate };
}

// ==================== APPROVAL WORKFLOW HOOK ====================
export function useApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);

  const createApproval = useCallback(async (projectId: string, entityType: string, approvers: string[]) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          approval: {
            projectId,
            entityType,
            approvers: approvers.map((id, i) => ({ approver_id: id, order: i, approved: false })),
          },
        }),
      });
      const result = await response.json();
      setApprovals([...approvals, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [approvals]);

  const updateApprovalStatus = useCallback(async (approvalId: string, approverId: string, approved: boolean) => {
    const response = await fetch('/api/features/approvals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_status',
        approvalId,
        approverId,
        approved,
      }),
    });
    const result = await response.json();
    // Update local state
    setApprovals(approvals.map(a => a.id === approvalId ? result.data : a));
    return result;
  }, [approvals]);

  return { approvals, loading, createApproval, updateApprovalStatus };
}

// ==================== SAFETY LOGS HOOK ====================
export function useSafetyLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const logIncident = useCallback(async (projectId: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_incident',
          log: { ...data, projectId },
        }),
      });
      const result = await response.json();
      setLogs([...logs, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [logs]);

  const fetchLogs = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/safety', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_logs', projectId }),
      });
      const result = await response.json();
      setLogs(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { logs, loading, logIncident, fetchLogs };
}

// ==================== COMMUNICATIONS HOOK ====================
export function useClientCommunications() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = useCallback(async (projectId: string, content: string, messageType: string = 'message') => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_message',
          message: { projectId, content, messageType },
        }),
      });
      const result = await response.json();
      setMessages([...messages, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const fetchMessages = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_messages', projectId }),
      });
      const result = await response.json();
      setMessages(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { messages, loading, sendMessage, fetchMessages };
}

// ==================== EQUIPMENT TRACKING HOOK ====================
export function useEquipment() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(false);

  const logMaintenance = useCallback(async (equipmentId: string, data: any) => {
    const response = await fetch('/api/features/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'log_maintenance',
        maintenance: { ...data, equipment_id: equipmentId },
      }),
    });
    return response.json();
  }, []);

  const fetchTeamEquipment = useCallback(async (teamId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_equipment', teamId }),
      });
      const result = await response.json();
      setEquipment(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { equipment, loading, logMaintenance, fetchTeamEquipment };
}

// ==================== WARRANTY TRACKING HOOK ====================
export function useWarranty() {
  const [warranties, setWarranties] = useState([]);
  const [loading, setLoading] = useState(false);

  const createWarranty = useCallback(async (projectId: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/warranty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          warranty: { ...data, projectId },
        }),
      });
      const result = await response.json();
      setWarranties([...warranties, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [warranties]);

  const fetchWarranties = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/warranty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_warranties', projectId }),
      });
      const result = await response.json();
      setWarranties(result.data || []);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return { warranties, loading, createWarranty, fetchWarranties };
}

// ==================== WORKFLOWS HOOK ====================
export function useWorkflows() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);

  const createWorkflow = useCallback(async (teamId: string, data: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/features/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          workflow: { ...data, team_id: teamId },
        }),
      });
      const result = await response.json();
      setWorkflows([...workflows, result.data]);
      return result;
    } finally {
      setLoading(false);
    }
  }, [workflows]);

  const executeWorkflow = useCallback(async (workflowId: string, entityType: string, entityId: string) => {
    const response = await fetch('/api/features/workflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'execute',
        workflowId,
        entityType,
        entityId,
      }),
    });
    return response.json();
  }, []);

  return { workflows, loading, createWorkflow, executeWorkflow };
}
