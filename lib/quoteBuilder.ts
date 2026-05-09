/**
 * Guided Quote Builder
 * Progressive questioning system that builds detailed quotes with line items and auto-generated materials lists
 */

import type { ProjectQuote, ProjectMaterial, MaterialItem } from "@/lib/workspaceTypes";

export type ProjectType =
  | "construction"
  | "landscaping"
  | "renovation"
  | "roofing"
  | "plumbing"
  | "electrical"
  | "hvac"
  | "painting"
  | "other";

export interface QuoteQuestion {
  id: string;
  question: string;
  type: "text" | "number" | "select" | "multiselect" | "yes_no";
  options?: string[];
  placeholder?: string;
  hint?: string;
}

export interface QuoteSession {
  id: string;
  projectType: ProjectType;
  clientName: string;
  projectTitle: string;
  currentQuestionIndex: number;
  answers: Record<string, any>;
  lineItems: LineItem[];
  totalCost: number;
  materials: MaterialItem[];
  status: "in-progress" | "completed";
  createdAt: Date;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotal: number;
  category: string;
}

// Questions templates for different project types
const QUOTE_QUESTIONS: Record<ProjectType, QuoteQuestion[]> = {
  construction: [
    {
      id: "structure_type",
      question: "What type of structure are you building?",
      type: "select",
      options: ["Barn", "Shed", "Garage", "Cabin", "Custom"],
      placeholder: "Select structure type",
    },
    {
      id: "dimensions",
      question: "What are the approximate dimensions (e.g., 30x40)?",
      type: "text",
      placeholder: "e.g., 30x40 feet",
      hint: "Length x Width",
    },
    {
      id: "foundation_type",
      question: "What foundation type do you need?",
      type: "select",
      options: ["Concrete Slab", "Gravel", "Post & Beam", "Full Basement"],
      placeholder: "Select foundation type",
    },
    {
      id: "roofing_material",
      question: "What roofing material?",
      type: "select",
      options: ["Metal", "Asphalt Shingles", "Corrugated Steel", "Standing Seam"],
      placeholder: "Select roofing material",
    },
    {
      id: "exterior_finish",
      question: "What exterior finish?",
      type: "select",
      options: ["Metal Siding", "Wood", "Vinyl", "Concrete"],
      placeholder: "Select exterior finish",
    },
    {
      id: "site_preparation",
      question: "Does the site require preparation (clearing, grading)?",
      type: "yes_no",
    },
    {
      id: "timeline",
      question: "What's your timeline (e.g., 4 weeks)?",
      type: "text",
      placeholder: "e.g., 4 weeks",
      hint: "Leave blank for standard timeline",
    },
  ],
  landscaping: [
    {
      id: "project_scope",
      question: "What's the main scope of work?",
      type: "multiselect",
      options: ["Grading", "Planting", "Hardscape", "Irrigation", "Maintenance"],
      placeholder: "Select all that apply",
    },
    {
      id: "area_size",
      question: "Approximate area size in sq ft?",
      type: "number",
      placeholder: "e.g., 5000",
    },
    {
      id: "existing_conditions",
      question: "Current condition of the site?",
      type: "select",
      options: ["Empty lot", "Overgrown", "Partially landscaped", "Just needs updates"],
      placeholder: "Select condition",
    },
  ],
  renovation: [
    {
      id: "room_type",
      question: "What room are you renovating?",
      type: "select",
      options: ["Kitchen", "Bathroom", "Bedroom", "Living Room", "Multiple"],
      placeholder: "Select room type",
    },
    {
      id: "renovation_scope",
      question: "Scope of renovation?",
      type: "multiselect",
      options: ["Flooring", "Cabinets", "Counters", "Fixtures", "Paint", "Electrical"],
      placeholder: "Select all that apply",
    },
    {
      id: "square_footage",
      question: "Approximate square footage?",
      type: "number",
      placeholder: "e.g., 400",
    },
  ],
  roofing: [
    {
      id: "roof_size",
      question: "Roof size in square feet?",
      type: "number",
      placeholder: "e.g., 2000",
    },
    {
      id: "material",
      question: "Roofing material?",
      type: "select",
      options: ["Asphalt Shingles", "Metal", "Slate", "Tile", "Composite"],
      placeholder: "Select material",
    },
    {
      id: "pitch",
      question: "Roof pitch?",
      type: "select",
      options: ["Low (< 4/12)", "Medium (4/12 - 8/12)", "Steep (> 8/12)"],
      placeholder: "Select pitch",
    },
    {
      id: "removal",
      question: "Does old roofing need removal?",
      type: "yes_no",
    },
  ],
  plumbing: [
    {
      id: "work_type",
      question: "Type of plumbing work?",
      type: "multiselect",
      options: ["New Installation", "Repair", "Replacement", "Inspection"],
      placeholder: "Select all that apply",
    },
    {
      id: "scope",
      question: "Scope of work?",
      type: "text",
      placeholder: "e.g., 3 fixtures, main line",
    },
  ],
  electrical: [
    {
      id: "work_type",
      question: "Type of electrical work?",
      type: "multiselect",
      options: ["New Circuit", "Upgrade Panel", "Outlets/Switches", "Lighting"],
      placeholder: "Select all that apply",
    },
    {
      id: "scope",
      question: "Scope details?",
      type: "text",
      placeholder: "e.g., kitchen remodel wiring",
    },
  ],
  hvac: [
    {
      id: "equipment_type",
      question: "Equipment type?",
      type: "select",
      options: ["Furnace", "AC Unit", "Heat Pump", "Full System"],
      placeholder: "Select type",
    },
    {
      id: "square_footage",
      question: "Building square footage?",
      type: "number",
      placeholder: "e.g., 2000",
    },
  ],
  painting: [
    {
      id: "area_type",
      question: "What are you painting?",
      type: "select",
      options: ["Interior Walls", "Exterior", "Trim/Doors", "Ceiling", "Multiple"],
      placeholder: "Select area type",
    },
    {
      id: "square_footage",
      question: "Approximate square footage?",
      type: "number",
      placeholder: "e.g., 3000",
    },
    {
      id: "prep_needed",
      question: "Surface prep needed?",
      type: "yes_no",
    },
  ],
  other: [
    {
      id: "description",
      question: "Describe the project",
      type: "text",
      placeholder: "Tell me about your project",
    },
  ],
};

// Pricing templates for cost calculations
const COST_MULTIPLIERS: Record<ProjectType, number> = {
  construction: 150, // $ per sq ft
  landscaping: 8, // $ per sq ft
  renovation: 100, // $ per sq ft
  roofing: 10, // $ per sq ft
  plumbing: 250, // per fixture
  electrical: 200, // per outlet/switch
  hvac: 6000, // base price for full system
  painting: 3, // $ per sq ft
  other: 100,
};

/**
 * Initialize a new quote session
 */
export function initializeQuoteSession(
  projectType: ProjectType,
  clientName: string,
  projectTitle: string
): QuoteSession {
  return {
    id: `quote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    projectType,
    clientName,
    projectTitle,
    currentQuestionIndex: 0,
    answers: {},
    lineItems: [],
    totalCost: 0,
    materials: [],
    status: "in-progress",
    createdAt: new Date(),
  };
}

/**
 * Get current question for a session
 */
export function getCurrentQuestion(session: QuoteSession): QuoteQuestion | null {
  const questions = QUOTE_QUESTIONS[session.projectType];
  if (session.currentQuestionIndex >= questions.length) {
    return null;
  }
  return questions[session.currentQuestionIndex];
}

/**
 * Record answer and advance to next question
 */
export function recordAnswer(session: QuoteSession, answer: any): QuoteSession {
  const currentQuestion = getCurrentQuestion(session);
  if (!currentQuestion) return session;

  session.answers[currentQuestion.id] = answer;
  session.currentQuestionIndex++;

  if (session.currentQuestionIndex >= QUOTE_QUESTIONS[session.projectType].length) {
    session.status = "completed";
    // Auto-generate quote when all questions answered
    generateQuoteLineItems(session);
  }

  return session;
}

/**
 * Generate line items and calculate costs based on answers
 */
function generateQuoteLineItems(session: QuoteSession): void {
  const answers = session.answers;
  const lineItems: LineItem[] = [];
  let totalCost = 0;

  if (session.projectType === "construction") {
    // Parse dimensions
    const dimensionsStr = answers.dimensions || "30x40";
    const [length, width] = dimensionsStr
      .split("x")
      .map((d: string) => parseInt(d.trim()))
      .filter(Boolean);

    const sqft = (length || 30) * (width || 40);

    // Site preparation
    if (answers.site_preparation === true) {
      const sitePrep = sqft * 2; // $2 per sq ft
      lineItems.push({
        id: "site-prep",
        description: "Site Preparation & Grading",
        quantity: 1,
        unit: "job",
        unitCost: sitePrep,
        subtotal: sitePrep,
        category: "prep",
      });
      totalCost += sitePrep;
    }

    // Foundation
    const foundationCost = sqft * 12; // $12 per sq ft
    lineItems.push({
      id: "foundation",
      description: `${answers.foundation_type || "Foundation"} Installation`,
      quantity: 1,
      unit: "job",
      unitCost: foundationCost,
      subtotal: foundationCost,
      category: "foundation",
    });
    totalCost += foundationCost;

    // Framing
    const framingCost = sqft * 8;
    lineItems.push({
      id: "framing",
      description: "Structural Framing",
      quantity: 1,
      unit: "job",
      unitCost: framingCost,
      subtotal: framingCost,
      category: "framing",
    });
    totalCost += framingCost;

    // Roofing
    const roofingCost = sqft * 6;
    lineItems.push({
      id: "roofing",
      description: `${answers.roofing_material || "Metal"} Roofing`,
      quantity: 1,
      unit: "job",
      unitCost: roofingCost,
      subtotal: roofingCost,
      category: "roofing",
    });
    totalCost += roofingCost;

    // Exterior
    const exteriorCost = sqft * 4;
    lineItems.push({
      id: "exterior",
      description: `${answers.exterior_finish || "Metal Siding"} Installation`,
      quantity: 1,
      unit: "job",
      unitCost: exteriorCost,
      subtotal: exteriorCost,
      category: "exterior",
    });
    totalCost += exteriorCost;

    // Labor (15% of material costs)
    const laborCost = totalCost * 0.15;
    lineItems.push({
      id: "labor",
      description: "Labor",
      quantity: 1,
      unit: "job",
      unitCost: laborCost,
      subtotal: laborCost,
      category: "labor",
    });
    totalCost += laborCost;

    // Contingency (10% buffer)
    const contingency = totalCost * 0.1;
    lineItems.push({
      id: "contingency",
      description: "Contingency (10%)",
      quantity: 1,
      unit: "job",
      unitCost: contingency,
      subtotal: contingency,
      category: "contingency",
    });
    totalCost += contingency;

    // Generate materials list from construction items
    session.materials = generateConstructionMaterials(sqft, answers);
  } else if (session.projectType === "roofing") {
    const sqft = answers.roof_size || 2000;

    if (answers.removal === true) {
      const removalCost = sqft * 1.5;
      lineItems.push({
        id: "removal",
        description: "Existing Roof Removal",
        quantity: 1,
        unit: "job",
        unitCost: removalCost,
        subtotal: removalCost,
        category: "removal",
      });
      totalCost += removalCost;
    }

    const materialCost = sqft * 8;
    lineItems.push({
      id: "material",
      description: `${answers.material || "Asphalt Shingles"} Material`,
      quantity: sqft,
      unit: "sq ft",
      unitCost: 8,
      subtotal: materialCost,
      category: "material",
    });
    totalCost += materialCost;

    const laborCost = sqft * 3;
    lineItems.push({
      id: "labor",
      description: "Installation Labor",
      quantity: sqft,
      unit: "sq ft",
      unitCost: 3,
      subtotal: laborCost,
      category: "labor",
    });
    totalCost += laborCost;
  } else if (session.projectType === "painting") {
    const sqft = answers.square_footage || 3000;

    if (answers.prep_needed === true) {
      const prepCost = sqft * 1.5;
      lineItems.push({
        id: "prep",
        description: "Surface Preparation",
        quantity: sqft,
        unit: "sq ft",
        unitCost: 1.5,
        subtotal: prepCost,
        category: "prep",
      });
      totalCost += prepCost;
    }

    const paintCost = sqft * 2.5;
    lineItems.push({
      id: "paint",
      description: "Painting Labor & Materials",
      quantity: sqft,
      unit: "sq ft",
      unitCost: 2.5,
      subtotal: paintCost,
      category: "painting",
    });
    totalCost += paintCost;
  } else if (session.projectType === "landscaping") {
    const sqft = answers.area_size || 5000;
    const baseCost = sqft * 8;

    lineItems.push({
      id: "landscaping",
      description: "Landscaping Work",
      quantity: sqft,
      unit: "sq ft",
      unitCost: 8,
      subtotal: baseCost,
      category: "landscaping",
    });
    totalCost += baseCost;
  }

  session.lineItems = lineItems;
  session.totalCost = Math.round(totalCost);
}

/**
 * Generate materials list for construction projects
 */
function generateConstructionMaterials(sqft: number, answers: Record<string, any>): MaterialItem[] {
  const materials: MaterialItem[] = [];

  // Foundation materials
  materials.push({
    id: `mat_foundation_${Date.now()}`,
    name: "Concrete",
    quantity: sqft,
    unit: "sq ft",
    estimatedCost: sqft * 8,
    vendor: "Local Concrete Supplier",
    notes: "4\" reinforced concrete slab",
  });

  // Framing materials
  materials.push({
    id: `mat_framing_${Date.now()}`,
    name: "Lumber (2x6, 2x8, 2x10)",
    quantity: Math.ceil(sqft / 10),
    unit: "unit",
    estimatedCost: Math.ceil(sqft / 10) * 150,
    vendor: "Lumber Yard",
    notes: "Pressure treated for exterior use",
  });

  // Roofing
  const roofingMaterial = answers.roofing_material || "Metal";
  materials.push({
    id: `mat_roofing_${Date.now()}`,
    name: `${roofingMaterial} Panels`,
    quantity: Math.ceil(sqft / 32),
    unit: "sheet",
    estimatedCost: Math.ceil(sqft / 32) * 200,
    vendor: "Roofing Supplier",
  });

  // Siding
  const sidingMaterial = answers.exterior_finish || "Metal Siding";
  materials.push({
    id: `mat_siding_${Date.now()}`,
    name: sidingMaterial,
    quantity: Math.ceil(sqft / 50),
    unit: "panel",
    estimatedCost: Math.ceil(sqft / 50) * 180,
    vendor: "Building Supply",
  });

  // Hardware
  materials.push({
    id: `mat_hardware_${Date.now()}`,
    name: "Bolts, Fasteners, Hardware",
    quantity: 1,
    unit: "lot",
    estimatedCost: 500,
    vendor: "Hardware Store",
  });

  return materials;
}

/**
 * Generate final quote with line items
 */
export function generateItemizedQuote(
  session: QuoteSession,
  recipientEmail?: string
): ProjectQuote {
  const formattedLineItems = session.lineItems
    .map(
      (item) => `
  ${item.description}
    Qty: ${item.quantity} ${item.unit}
    Unit Cost: $${item.unitCost.toFixed(2)}
    Subtotal: $${item.subtotal.toFixed(2)}`
    )
    .join("\n");

  const content = `Quote for ${session.clientName}
Project: ${session.projectTitle}
Date: ${new Date().toLocaleDateString()}

Description: Professional ${session.projectType} project

Line Items:
${formattedLineItems}

---
Total Estimate: $${session.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}

Notes:
- This estimate is valid for 30 days
- Payment terms: 50% deposit, 50% upon completion
- Timeline: To be confirmed upon project start
- Subject to site inspection

Thank you for your business!`;

  return {
    id: session.id,
    projectId: "", // Will be set when attached to project
    title: `${session.projectTitle} - Quote`,
    content,
    recipient: recipientEmail || session.clientName,
    status: "draft",
    amount: session.totalCost,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdFrom: "assistant",
  };
}

/**
 * Generate materials list for project
 */
export function generateMaterialsList(session: QuoteSession): ProjectMaterial {
  const totalCost = session.materials.reduce(
    (sum, item) => sum + (item.estimatedCost || 0),
    0
  );

  return {
    id: `materials_${session.id}`,
    projectId: "",
    title: `Materials for ${session.projectTitle}`,
    items: session.materials,
    totalEstimatedCost: totalCost,
    createdAt: new Date(),
    createdFrom: "assistant",
  };
}
