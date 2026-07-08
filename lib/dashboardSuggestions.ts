import type { OnboardingData } from "./onboarding";

export interface DashboardSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  priority: "high" | "medium" | "low";
  action: string;
  actionLabel: string;
  category: string;
  tip?: string;
}

export interface DailyBrief {
  greeting: string;
  focusArea: string;
  todaysTip: string;
  upcomingItems: string[];
}

export function generateSmartSuggestions(profile: OnboardingData): DashboardSuggestion[] {
  const suggestions: DashboardSuggestion[] = [];
  const painPoints = profile.painPoints.map(p => p.toLowerCase());

  // Role-specific core suggestions
  if (profile.role === "contractor") {
    if (painPoints.includes("scheduling")) {
      suggestions.push({
        id: "contractor-scheduling",
        title: "Schedule Optimizer",
        description: "AI can analyze your jobs and suggest optimal scheduling to reduce travel time and maximize efficiency.",
        icon: "📅",
        priority: "high",
        action: "/chat?task=scheduling",
        actionLabel: "Plan Schedule",
        category: "scheduling",
        tip: "Pro tip: Include travel time and material availability for smarter suggestions."
      });
    }

    if (painPoints.includes("team_communication")) {
      suggestions.push({
        id: "contractor-slack",
        title: "Team Communication Hub",
        description: "Connect Slack to get instant updates from your team and AI summaries of messages.",
        icon: "💬",
        priority: "high",
        action: "/integrations",
        actionLabel: "Connect Slack",
        category: "communication",
        tip: "Real-time notifications keep everyone aligned on job site changes."
      });
    }

    if (painPoints.includes("cost_tracking")) {
      suggestions.push({
        id: "contractor-expenses",
        title: "Smart Expense Tracking",
        description: "Upload receipts and let AI categorize expenses automatically for better profit analysis.",
        icon: "💰",
        priority: "high",
        action: "/chat?task=expenses",
        actionLabel: "Track Expenses",
        category: "financial",
        tip: "Monitor margins per project to identify your most profitable work."
      });
    }

    suggestions.push({
      id: "contractor-quote",
      title: "Quick Quote Generator",
      description: "Build professional quotes in minutes. AI helps you stay competitive and consistent.",
      icon: "📄",
      priority: "medium",
      action: "/chat?task=quote",
      actionLabel: "Generate Quote",
      category: "sales",
      tip: "Include all details: scope, materials, labor, timeline for accurate estimates."
    });
  }

  if (profile.role === "business_owner") {
    if (painPoints.includes("client_retention")) {
      suggestions.push({
        id: "owner-retention",
        title: "Client Retention Strategy",
        description: "AI suggests personalized follow-ups and check-ins to keep clients engaged.",
        icon: "🤝",
        priority: "high",
        action: "/chat?task=retention",
        actionLabel: "Plan Follow-ups",
        category: "sales",
        tip: "Regular touchpoints reduce churn by 40% on average."
      });
    }

    if (painPoints.includes("scaling")) {
      suggestions.push({
        id: "owner-scaling",
        title: "Growth Roadmap",
        description: "Get AI-generated playbook for scaling based on your business metrics.",
        icon: "📈",
        priority: "high",
        action: "/chat?task=scaling",
        actionLabel: "View Roadmap",
        category: "strategy"
      });
    }

    suggestions.push({
      id: "owner-dashboard",
      title: "Business Intelligence",
      description: "Weekly summary of KPIs, customer metrics, and actionable insights.",
      icon: "📊",
      priority: "medium",
      action: "/integrations",
      actionLabel: "Connect Tools",
      category: "analytics"
    });
  }

  if (profile.role === "stay_at_home_parent") {
    if (painPoints.includes("time_management")) {
      suggestions.push({
        id: "parent-schedule",
        title: "Family Calendar Assistant",
        description: "AI learns your routines and suggests optimal scheduling for appointments, meals, and activities.",
        icon: "⏰",
        priority: "high",
        action: "/chat?task=calendar",
        actionLabel: "Build Schedule",
        category: "organization"
      });
    }

    if (painPoints.includes("budget_management")) {
      suggestions.push({
        id: "parent-budget",
        title: "Smart Budget Helper",
        description: "Track spending patterns and get suggestions to save money on groceries, activities, and services.",
        icon: "💸",
        priority: "high",
        action: "/chat?task=budget",
        actionLabel: "Plan Budget",
        category: "financial"
      });
    }

    suggestions.push({
      id: "parent-meal",
      title: "Weekly Meal Planner",
      description: "AI generates meal plans based on dietary needs, budget, and time available.",
      icon: "🍽️",
      priority: "medium",
      action: "/chat?task=meals",
      actionLabel: "Plan Meals",
      category: "household"
    });
  }

  if (profile.role === "freelancer") {
    if (painPoints.includes("client_management")) {
      suggestions.push({
        id: "freelancer-clients",
        title: "Client Relationship Manager",
        description: "Track all client communications and AI suggests best times to follow up on proposals.",
        icon: "👥",
        priority: "high",
        action: "/chat?task=clients",
        actionLabel: "Manage Clients",
        category: "sales"
      });
    }

    if (painPoints.includes("invoicing")) {
      suggestions.push({
        id: "freelancer-invoices",
        title: "Smart Invoicing",
        description: "Generate and track invoices automatically. AI reminds you about overdue payments.",
        icon: "📋",
        priority: "high",
        action: "/integrations",
        actionLabel: "Setup Invoicing",
        category: "financial"
      });
    }

    suggestions.push({
      id: "freelancer-portfolio",
      title: "Portfolio Showcase",
      description: "AI helps you present your best work to attract higher-paying clients.",
      icon: "🎨",
      priority: "medium",
      action: "/chat?task=portfolio",
      actionLabel: "Update Portfolio",
      category: "marketing"
    });
  }

  if (profile.role === "student") {
    if (painPoints.includes("deadline_tracking")) {
      suggestions.push({
        id: "student-deadlines",
        title: "Assignment Tracker",
        description: "Never miss a deadline. AI sends smart reminders based on assignment complexity.",
        icon: "📝",
        priority: "high",
        action: "/chat?task=assignments",
        actionLabel: "Track Assignments",
        category: "academic"
      });
    }

    if (painPoints.includes("study_organization")) {
      suggestions.push({
        id: "student-study",
        title: "Study Schedule Generator",
        description: "AI creates personalized study plans and breaks for optimal retention.",
        icon: "📚",
        priority: "high",
        action: "/chat?task=study",
        actionLabel: "Create Study Plan",
        category: "academic"
      });
    }

    suggestions.push({
      id: "student-notes",
      title: "Smart Note Organization",
      description: "Organize notes by subject and AI suggests what to review before exams.",
      icon: "✍️",
      priority: "medium",
      action: "/chat?task=notes",
      actionLabel: "Organize Notes",
      category: "academic"
    });
  }

  // Cross-cutting suggestions for all
  if (profile.painPoints.length > 0 && !painPoints.includes("none")) {
    suggestions.push({
      id: "ai-assistant",
      title: "Daily AI Briefing",
      description: `AI creates a personalized daily brief focused on: ${profile.painPoints.map(p => p.replaceAll("_", " ")).join(", ")}.`,
      icon: "🤖",
      priority: "medium",
      action: "/chat?task=briefing",
      actionLabel: "Get Briefing",
      category: "productivity"
    });
  }

  // Integration suggestions based on tools
  if (!profile.tools.includes("slack")) {
    suggestions.push({
      id: "suggest-slack",
      title: "Connect with Your Team",
      description: "Slack integration lets your AI assistant communicate with your team automatically.",
      icon: "💬",
      priority: "low",
      action: "/integrations",
      actionLabel: "Connect",
      category: "integration"
    });
  }

  if (!profile.tools.includes("calendar")) {
    suggestions.push({
      id: "suggest-calendar",
      title: "Sync Your Calendar",
      description: "Google Calendar integration helps AI understand your availability and schedule.",
      icon: "📅",
      priority: "low",
      action: "/integrations",
      actionLabel: "Connect",
      category: "integration"
    });
  }

  return suggestions.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function generateDailyBrief(profile: OnboardingData): DailyBrief {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const greetings: Record<string, Record<string, string>> = {
    contractor: {
      morning: "Ready to optimize your day? Let's schedule those jobs.",
      afternoon: "How are the projects moving? Need to track anything?",
      evening: "Great work today. Want to plan tomorrow?"
    },
    business_owner: {
      morning: "Your business waits for no one. What's today's priority?",
      afternoon: "Check in on your key metrics and client pipeline.",
      evening: "Reflect on wins today and plan tomorrow's strategy."
    },
    stay_at_home_parent: {
      morning: "Good morning! Let's organize today's schedule.",
      afternoon: "How's the day treating you? Need to reschedule anything?",
      evening: "You did amazing today. Want help planning tomorrow?"
    },
    freelancer: {
      morning: "Let's focus on revenue today. Any proposals to send?",
      afternoon: "How are your active projects? Any blockers?",
      evening: "Invoice check-in: any payments due today?"
    },
    student: {
      morning: "Let's crush those assignments! What's due soon?",
      afternoon: "Study break! How's your progress today?",
      evening: "Tomorrow's study session: want me to prep?"
    },
    other: {
      morning: "Good morning! What's on your mind today?",
      afternoon: "Making progress. Anything to adjust?",
      evening: "Wrap up and prepare for tomorrow."
    }
  };

  const focusAreas: Record<string, string> = {
    contractor: "Maximize job efficiency and team coordination",
    business_owner: "Drive growth and client satisfaction",
    stay_at_home_parent: "Balance family, home, and self-care",
    freelancer: "Build revenue and client relationships",
    student: "Academic success and skill building",
    other: "Personal productivity and goals"
  };

  const dailyTips: Record<string, string[]> = {
    contractor: [
      "Block travel time between jobs to reduce wasted time.",
      "Communicate daily material needs to your team.",
      "Review job estimates vs. actual costs weekly."
    ],
    business_owner: [
      "Check 3 key metrics: revenue, client retention, pipeline.",
      "Spend 30 min on strategy, not just tactics.",
      "Follow up with at least one prospect today."
    ],
    stay_at_home_parent: [
      "Meal prep on Sundays saves 5 hours per week.",
      "Schedule 30 min of 'you time' daily.",
      "Use a family calendar so everyone knows the plan."
    ],
    freelancer: [
      "Send one proposal or reach out to one prospect today.",
      "Check invoices: follow up on anything 15+ days overdue.",
      "Update your portfolio monthly with your best work."
    ],
    student: [
      "Review the hardest material in your best focus hours.",
      "Start major assignments 2 weeks early.",
      "Join a study group for tougher subjects."
    ],
    other: ["Focus on your top priority today.", "Take breaks every 90 minutes.", "Reflect on what worked today."]
  };

  const roleKey = profile.role || "other";
  const greeting = greetings[roleKey]?.[timeOfDay] || greetings.other[timeOfDay];
  const focusArea = focusAreas[roleKey] || focusAreas.other;
  const tips = dailyTips[roleKey] || dailyTips.other;
  const todaysTip = tips[Math.floor(Math.random() * tips.length)];

  const upcomingItems = profile.painPoints.map(point => `Focus on: ${point.replaceAll("_", " ")}`).slice(0, 3);
  if (profile.tools.length > 0) {
    upcomingItems.push(`Tools active: ${profile.tools.map(t => t.replaceAll("_", " ")).join(", ")}`);
  }

  return {
    greeting,
    focusArea,
    todaysTip,
    upcomingItems: upcomingItems.slice(0, 3)
  };
}
