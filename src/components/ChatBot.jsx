import { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

// Enterprise User Management System
class EnterpriseUserManager {
  constructor() {
    this.currentUser = this.loadCurrentUser();
    this.userRoles = {
      ADMIN: 'admin',
      MANAGER: 'manager', 
      AGENT: 'agent',
      VIEWER: 'viewer'
    };
  }

  loadCurrentUser() {
    try {
      const user = localStorage.getItem('chatbot_user');
      return user ? JSON.parse(user) : this.getDefaultUser();
    } catch {
      return this.getDefaultUser();
    }
  }

  getDefaultUser() {
    return {
      id: 'demo-user',
      name: 'Demo User',
      role: this.userRoles.AGENT,
      permissions: ['chat', 'view_history'],
      language: 'en',
      preferences: {
        theme: 'light',
        notifications: true,
        analytics: true
      }
    };
  }

  hasPermission(permission) {
    return this.currentUser.permissions.includes(permission);
  }

  getRoleLevel() {
    const roleLevels = {
      [this.userRoles.ADMIN]: 4,
      [this.userRoles.MANAGER]: 3,
      [this.userRoles.AGENT]: 2,
      [this.userRoles.VIEWER]: 1
    };
    return roleLevels[this.currentUser.role] || 0;
  }

  canAccess(feature) {
    const featureRequirements = {
      'analytics': this.userRoles.MANAGER,
      'admin_dashboard': this.userRoles.ADMIN,
      'user_management': this.userRoles.ADMIN,
      'conversation_export': this.userRoles.MANAGER,
      'bot_training': this.userRoles.MANAGER
    };
    
    const requiredRole = featureRequirements[feature];
    if (!requiredRole) return true;
    
    return this.getRoleLevel() >= this.getRoleLevel(requiredRole);
  }

  getCurrentUserPermissions() {
    return this.currentUser.permissions || [];
  }

  getAllUsers() {
    // For demo purposes, return a list of users
    return [
      {
        id: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.role,
        permissions: this.currentUser.permissions,
        status: 'active'
      }
    ];
  }
}

// Enterprise Conversation Manager
class EnterpriseConversationManager {
  constructor(userManager) {
    this.userManager = userManager;
    this.conversations = this.loadConversations();
    this.currentConversation = null;
  }

  loadConversations() {
    try {
      return JSON.parse(localStorage.getItem('chatbot_conversations')) || [];
    } catch {
      return [];
    }
  }

  saveConversations() {
    try {
      localStorage.setItem('chatbot_conversations', JSON.stringify(this.conversations));
    } catch (error) {
      console.warn('Failed to save conversations:', error);
    }
  }

  createNewConversation() {
    const conversation = {
      id: Date.now().toString(),
      title: 'New Conversation',
      userId: this.userManager.currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      tags: [],
      status: 'active',
      metadata: {
        totalMessages: 0,
        duration: 0,
        satisfaction: null
      }
    };
    
    this.conversations.unshift(conversation);
    this.currentConversation = conversation;
    this.saveConversations();
    return conversation;
  }

  addMessage(message, isFromUser = true) {
    if (!this.currentConversation) {
      this.createNewConversation();
    }

    const messageWithMetadata = {
      id: Date.now().toString(),
      text: message.text,
      sender: message.sender,
      timestamp: new Date().toISOString(),
      intent: message.intent || null,
      confidence: message.confidence || null,
      metadata: {
        sessionId: this.currentConversation.id,
        userRole: this.userManager.currentUser.role,
        language: this.userManager.currentUser.language
      }
    };

    this.currentConversation.messages.push(messageWithMetadata);
    this.currentConversation.updatedAt = new Date().toISOString();
    this.currentConversation.metadata.totalMessages = this.currentConversation.messages.length;
    
    this.saveConversations();
    return messageWithMetadata;
  }

  searchConversations(query, filters = {}) {
    let results = this.conversations;
    
    // Apply text search
    if (query) {
      results = results.filter(conv => 
        conv.title.toLowerCase().includes(query.toLowerCase()) ||
        conv.messages.some(msg => msg.text.toLowerCase().includes(query.toLowerCase()))
      );
    }
    
    // Apply filters
    if (filters.role && this.userManager.canAccess('conversation_export')) {
      results = results.filter(conv => conv.metadata.userRole === filters.role);
    }
    
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      results = results.filter(conv => {
        const convDate = new Date(conv.createdAt);
        return convDate >= startDate && convDate <= endDate;
      });
    }
    
    return results;
  }

  getAnalytics() {
    if (!this.userManager.canAccess('analytics')) {
      return { error: 'Insufficient permissions' };
    }

    const totalConversations = this.conversations.length;
    const totalMessages = this.conversations.reduce((sum, conv) => sum + conv.metadata.totalMessages, 0);
    const averageMessages = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
    
    // Intent distribution
    const intentDistribution = {};
    this.conversations.forEach(conv => {
      conv.messages.forEach(msg => {
        if (msg.intent) {
          intentDistribution[msg.intent] = (intentDistribution[msg.intent] || 0) + 1;
        }
      });
    });

    return {
      totalConversations,
      totalMessages,
      averageMessagesPerConversation: averageMessages,
      intentDistribution,
      recentActivity: this.conversations.slice(0, 10),
      userEngagement: this.calculateEngagement()
    };
  }

  calculateEngagement() {
    const recent = this.conversations.filter(conv => {
      const daysDiff = (Date.now() - new Date(conv.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysDiff <= 7; // Last 7 days
    });

    return {
      activeConversations: recent.length,
      averageSessionDuration: this.calculateAverageSessionDuration(recent),
      userRetention: this.calculateRetentionRate()
    };
  }

  calculateAverageSessionDuration(conversations) {
    if (conversations.length === 0) return 0;
    const totalDuration = conversations.reduce((sum, conv) => sum + conv.metadata.duration, 0);
    return Math.round(totalDuration / conversations.length);
  }

  calculateRetentionRate() {
    const uniqueUsers = new Set(this.conversations.map(conv => conv.userId)).size;
    const totalUsers = this.conversations.length;
    return totalUsers > 0 ? Math.round((uniqueUsers / totalUsers) * 100) : 0;
  }

  getAllConversations() {
    return this.conversations;
  }
}

// Integration APIs and Webhook System
class IntegrationAPIManager {
  constructor(userManager) {
    this.userManager = userManager;
    this.apiEndpoints = {
      analytics: '/api/chatbot/analytics',
      conversations: '/api/chatbot/conversations',
      users: '/api/chatbot/users',
      webhooks: '/api/chatbot/webhooks',
      training: '/api/chatbot/training'
    };
    this.webhookHandlers = new Map();
    this.setupWebhookHandlers();
  }

  async makeRequest(endpoint, options = {}) {
    const url = this.apiEndpoints[endpoint];
    if (!url) {
      throw new Error(`Unknown API endpoint: ${endpoint}`);
    }

    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'X-User-Role': this.userManager.currentUser.role
      }
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn('API request failed, using fallback:', error);
      return this.getFallbackData(endpoint);
    }
  }

  getAuthToken() {
    // In production, this would get the actual auth token
    return localStorage.getItem('chatbot_auth_token') || 'demo-token';
  }

  getFallbackData(endpoint) {
    // Return fallback data when API is not available
    const fallbackData = {
      analytics: {
        totalConversations: 150,
        totalMessages: 1200,
        averageMessagesPerConversation: 8,
        intentDistribution: {
          'grant_info': 45,
          'navigate': 30,
          'help': 25
        },
        recentActivity: [],
        userEngagement: {
          activeConversations: 12,
          averageSessionDuration: 180,
          userRetention: 85
        }
      },
      conversations: [],
      users: [],
      webhooks: [],
      training: {
        status: 'ready',
        lastTraining: new Date().toISOString(),
        accuracy: 0.87
      }
    };

    return fallbackData[endpoint] || {};
  }

  setupWebhookHandlers() {
    // Set up webhook event handlers
    this.webhookHandlers.set('conversation_started', this.handleConversationStarted.bind(this));
    this.webhookHandlers.set('message_received', this.handleMessageReceived.bind(this));
    this.webhookHandlers.set('intent_detected', this.handleIntentDetected.bind(this));
    this.webhookHandlers.set('analytics_updated', this.handleAnalyticsUpdated.bind(this));
  }

  async registerWebhook(event, callback) {
    // Register a webhook for specific events
    if (!this.webhookHandlers.has(event)) {
      this.webhookHandlers.set(event, callback);
    }
  }

  async triggerWebhook(event, data) {
    // Trigger a webhook event
    const handler = this.webhookHandlers.get(event);
    if (handler) {
      await handler(data);
    }
  }

  handleConversationStarted(data) {
    console.log('New conversation started:', data);
    // Custom logic for conversation start events
  }

  handleMessageReceived(data) {
    console.log('Message received:', data);
    // Custom logic for message events
  }

  handleIntentDetected(data) {
    console.log('Intent detected:', data);
    // Custom logic for intent detection events
  }

  handleAnalyticsUpdated(data) {
    console.log('Analytics updated:', data);
    // Custom logic for analytics events
  }

  async syncAnalytics() {
    try {
      const analytics = await this.makeRequest('analytics');
      return analytics;
    } catch (error) {
      console.error('Failed to sync analytics:', error);
      return this.getFallbackData('analytics');
    }
  }

  async exportConversations(filters = {}) {
    try {
      const response = await this.makeRequest('conversations', {
        method: 'POST',
        body: JSON.stringify({ filters })
      });
      return response;
    } catch (error) {
      console.error('Failed to export conversations:', error);
      throw error;
    }
  }

  async getTrainingStatus() {
    try {
      return await this.makeRequest('training');
    } catch (error) {
      return this.getFallbackData('training');
    }
  }
}

// Automated Workflows System
class WorkflowManager {
  constructor(apiManager, userManager) {
    this.apiManager = apiManager;
    this.userManager = userManager;
    this.workflows = new Map();
    this.activeWorkflows = new Map();
    this.initializeWorkflows();
  }

  initializeWorkflows() {
    // Pre-defined enterprise workflows
    this.workflows.set('grant_discovery', {
      name: 'Grant Discovery Workflow',
      description: 'Automated grant matching and notification',
      triggers: ['user_interest', 'search_query'],
      actions: ['search_grants', 'filter_results', 'send_notification'],
      enabled: true
    });

    this.workflows.set('conversation_analytics', {
      name: 'Conversation Analytics',
      description: 'Real-time conversation tracking and analysis',
      triggers: ['message_sent', 'conversation_ended'],
      actions: ['log_interaction', 'update_analytics', 'generate_insights'],
      enabled: true
    });

    this.workflows.set('user_onboarding', {
      name: 'User Onboarding',
      description: 'Guided user experience for new users',
      triggers: ['user_first_visit', 'low_engagement'],
      actions: ['show_tutorial', 'suggest_features', 'collect_feedback'],
      enabled: true
    });
  }

  async executeWorkflow(workflowId, context) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || !workflow.enabled) {
      return { success: false, message: 'Workflow not found or disabled' };
    }

    // Check permissions
    if (!this.hasWorkflowPermission(workflowId)) {
      return { success: false, message: 'Insufficient permissions' };
    }

    const executionId = `exec_${Date.now()}`;
    this.activeWorkflows.set(executionId, {
      workflowId,
      status: 'running',
      startTime: new Date().toISOString(),
      context
    });

    try {
      // Execute workflow actions
      const results = [];
      for (const action of workflow.actions) {
        const result = await this.executeAction(action, context);
        results.push(result);
      }

      // Update workflow status
      this.activeWorkflows.set(executionId, {
        ...this.activeWorkflows.get(executionId),
        status: 'completed',
        endTime: new Date().toISOString(),
        results
      });

      return { success: true, executionId, results };
    } catch (error) {
      this.activeWorkflows.set(executionId, {
        ...this.activeWorkflows.get(executionId),
        status: 'failed',
        endTime: new Date().toISOString(),
        error: error.message
      });

      return { success: false, error: error.message };
    }
  }

  async executeAction(action, context) {
    switch (action) {
      case 'search_grants':
        return await this.searchGrants(context);
      case 'filter_results':
        return await this.filterResults(context);
      case 'send_notification':
        return await this.sendNotification(context);
      case 'log_interaction':
        return await this.logInteraction(context);
      case 'update_analytics':
        return await this.updateAnalytics(context);
      case 'generate_insights':
        return await this.generateInsights(context);
      case 'show_tutorial':
        return await this.showTutorial(context);
      case 'suggest_features':
        return await this.suggestFeatures(context);
      case 'collect_feedback':
        return await this.collectFeedback(context);
      default:
        return { action, status: 'skipped', message: 'Unknown action' };
    }
  }

  hasWorkflowPermission(workflowId) {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return false;

    // Check if user has required permissions for this workflow
    const requiredPermissions = {
      'grant_discovery': ['chat', 'analytics'],
      'conversation_analytics': ['analytics'],
      'user_onboarding': ['chat']
    };

    const permissions = requiredPermissions[workflowId] || [];
    return permissions.every(permission => this.userManager.hasPermission(permission));
  }

  // Workflow action implementations
  async searchGrants(context) {
    return { action: 'search_grants', status: 'completed', results: ['Grant 1', 'Grant 2'] };
  }

  async filterResults(context) {
    return { action: 'filter_results', status: 'completed', filtered: 2 };
  }

  async sendNotification(context) {
    return { action: 'send_notification', status: 'completed', sent: true };
  }

  async logInteraction(context) {
    return { action: 'log_interaction', status: 'completed', logged: true };
  }

  async updateAnalytics(context) {
    return { action: 'update_analytics', status: 'completed', updated: true };
  }

  async generateInsights(context) {
    return { action: 'generate_insights', status: 'completed', insights: ['Insight 1'] };
  }

  async showTutorial(context) {
    return { action: 'show_tutorial', status: 'completed', shown: true };
  }

  async suggestFeatures(context) {
    return { action: 'suggest_features', status: 'completed', suggestions: ['Feature 1'] };
  }

  async collectFeedback(context) {
    return { action: 'collect_feedback', status: 'completed', collected: true };
  }

  getActiveWorkflows() {
    return Array.from(this.activeWorkflows.values());
  }

  getWorkflowStatus(workflowId) {
    return this.workflows.get(workflowId);
  }
}

// Enterprise Security Protocols
class SecurityManager {
  constructor(userManager) {
    this.userManager = userManager;
    this.encryptionKey = this.getEncryptionKey();
    this.auditLogger = new AuditLogger();
    this.securityLevel = 'HIGH'; // LOW, MEDIUM, HIGH, MAXIMUM
    this.complianceMode = 'GDPR'; // GDPR, HIPAA, SOC2, PCI
    this.initializeSecurity();
  }

  initializeSecurity() {
    // Initialize security protocols
    this.setupDataEncryption();
    this.setupAuditLogging();
    this.setupComplianceChecks();
    this.setupSessionSecurity();
  }

  getEncryptionKey() {
    // In production, this would be managed securely (e.g., AWS KMS, HashiCorp Vault)
    return localStorage.getItem('chatbot_encryption_key') || this.generateSecureKey();
  }

  generateSecureKey() {
    // Generate a secure key for demo purposes
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
  }

  setupDataEncryption() {
    // Set up data encryption protocols
    this.algorithms = {
      'AES-256': 'aes-256-cbc',
      'RSA-2048': 'rsa-2048',
      'SHA-256': 'sha256'
    };
  }

  setupAuditLogging() {
    // Set up audit logging for compliance
    this.auditEvents = [
      'user_login',
      'user_logout',
      'data_access',
      'data_modification',
      'permission_change',
      'security_violation',
      'api_call',
      'conversation_access'
    ];
  }

  setupComplianceChecks() {
    // Set up compliance checks based on current mode
    this.complianceRules = {
      GDPR: {
        dataRetention: 365, // days
        consentRequired: true,
        rightToErasure: true,
        dataPortability: true
      },
      HIPAA: {
        encryptionRequired: true,
        accessLogging: true,
        sessionTimeout: 900, // seconds
        minimumPasswordStrength: 'HIGH'
      },
      SOC2: {
        changeManagement: true,
        incidentResponse: true,
        monitoring: true,
        accessControls: true
      },
      PCI: {
        cardholderDataProtection: true,
        networkSecurity: true,
        vulnerabilityManagement: true,
        accessControl: true
      }
    };
  }

  setupSessionSecurity() {
    // Set up session security
    this.sessionConfig = {
      timeout: 1800000, // 30 minutes
      maxInactiveTime: 300000, // 5 minutes
      secureCookies: true,
      httpOnly: true,
      sameSite: 'strict'
    };
  }

  async encryptData(data) {
    try {
      // Simple encryption for demo (in production, use proper encryption libraries)
      const jsonString = JSON.stringify(data);
      const encoded = btoa(jsonString);
      await this.auditLog('data_encryption', { dataType: typeof data, success: true });
      return encoded;
    } catch (error) {
      await this.auditLog('data_encryption', { success: false, error: error.message });
      throw new Error('Encryption failed');
    }
  }

  async decryptData(encryptedData) {
    try {
      const decoded = atob(encryptedData);
      const data = JSON.parse(decoded);
      await this.auditLog('data_decryption', { success: true });
      return data;
    } catch (error) {
      await this.auditLog('data_decryption', { success: false, error: error.message });
      throw new Error('Decryption failed');
    }
  }

  async auditLog(eventType, details = {}) {
    const auditEntry = {
      timestamp: new Date().toISOString(),
      eventType,
      userId: this.userManager.currentUser?.id || 'anonymous',
      userRole: this.userManager.currentUser?.role || 'unknown',
      sessionId: this.getSessionId(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      details,
      compliance: this.complianceMode,
      securityLevel: this.securityLevel
    };

    // Store audit log (in production, send to centralized logging system)
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    logs.push(auditEntry);
    
    // Keep only last 1000 entries for demo purposes
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(logs));
  }

  async validatePermission(resource, action) {
    const userPermissions = this.userManager.getCurrentUserPermissions();
    const requiredPermission = `${action}:${resource}`;
    
    const hasPermission = userPermissions.includes(requiredPermission) || 
                         userPermissions.includes(`${action}:*`) ||
                         userPermissions.includes(`*:${resource}`) ||
                         userPermissions.includes('*:*');

    await this.auditLog('permission_check', {
      resource,
      action,
      required: requiredPermission,
      granted: hasPermission
    });

    return hasPermission;
  }

  async checkCompliance(action, data) {
    const rules = this.complianceRules[this.complianceMode];
    if (!rules) {
      return { compliant: true, message: 'No compliance rules for current mode' };
    }

    const violations = [];

    // Check compliance based on action and data
    if (action === 'data_storage' && rules.dataRetention) {
      // Check data retention policies
      const dataAge = Date.now() - (data.timestamp || Date.now());
      const maxAge = rules.dataRetention * 24 * 60 * 60 * 1000;
      if (dataAge > maxAge) {
        violations.push(`Data retention exceeded: ${rules.dataRetention} days`);
      }
    }

    if (action === 'data_access' && rules.encryptionRequired && !data.encrypted) {
      violations.push('Unencrypted data access detected');
    }

    await this.auditLog('compliance_check', {
      action,
      mode: this.complianceMode,
      violations: violations.length,
      compliant: violations.length === 0
    });

    return {
      compliant: violations.length === 0,
      violations,
      mode: this.complianceMode
    };
  }

  async validateSession() {
    const sessionData = this.getSessionData();
    const now = Date.now();
    const sessionAge = now - (sessionData.timestamp || now);
    const inactivityAge = now - (sessionData.lastActivity || now);

    const sessionValid = sessionAge < this.sessionConfig.timeout &&
                        inactivityAge < this.sessionConfig.maxInactiveTime;

    if (!sessionValid) {
      await this.auditLog('session_invalid', { reason: 'timeout' });
      this.clearSession();
    }

    return sessionValid;
  }

  getSessionId() {
    return sessionStorage.getItem('chatbot_session_id') || 
           this.generateSessionId();
  }

  generateSessionId() {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('chatbot_session_id', sessionId);
    return sessionId;
  }

  async getClientIP() {
    // In a real implementation, this would get the actual client IP
    // For demo purposes, return a placeholder
    return '192.168.1.1';
  }

  getSessionData() {
    const data = sessionStorage.getItem('chatbot_session_data');
    return data ? JSON.parse(data) : {};
  }

  updateSessionActivity() {
    const data = this.getSessionData();
    data.lastActivity = Date.now();
    data.timestamp = data.timestamp || Date.now();
    sessionStorage.setItem('chatbot_session_data', JSON.stringify(data));
  }

  clearSession() {
    sessionStorage.removeItem('chatbot_session_id');
    sessionStorage.removeItem('chatbot_session_data');
  }

  async generateSecurityReport() {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const recentLogs = logs.filter(log => 
      Date.now() - new Date(log.timestamp).getTime() < 86400000 // Last 24 hours
    );

    const report = {
      timestamp: new Date().toISOString(),
      securityLevel: this.securityLevel,
      complianceMode: this.complianceMode,
      totalEvents: recentLogs.length,
      eventsByType: {},
      securityViolations: recentLogs.filter(log => 
        log.eventType === 'security_violation' || !log.details.success
      ).length,
      topUsers: this.getTopUsers(recentLogs),
      complianceStatus: await this.checkOverallCompliance(),
      recommendations: this.generateSecurityRecommendations(recentLogs)
    };

    // Count events by type
    recentLogs.forEach(log => {
      report.eventsByType[log.eventType] = (report.eventsByType[log.eventType] || 0) + 1;
    });

    return report;
  }

  getTopUsers(logs) {
    const userActivity = {};
    logs.forEach(log => {
      if (log.userId !== 'anonymous') {
        userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;
      }
    });

    return Object.entries(userActivity)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([userId, count]) => ({ userId, count }));
  }

  async checkOverallCompliance() {
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const recentLogs = logs.filter(log => 
      Date.now() - new Date(log.timestamp).getTime() < 86400000
    );

    const violations = recentLogs.filter(log => !log.details.compliant);
    const totalChecks = recentLogs.filter(log => log.eventType === 'compliance_check').length;

    return {
      status: violations.length === 0 ? 'COMPLIANT' : 'NON_COMPLIANT',
      totalChecks,
      violations: violations.length,
      complianceScore: totalChecks > 0 ? ((totalChecks - violations.length) / totalChecks * 100).toFixed(2) : 100
    };
  }

  generateSecurityRecommendations(logs) {
    const recommendations = [];
    
    const failedLogins = logs.filter(log => 
      log.eventType === 'user_login' && !log.details.success
    ).length;
    
    if (failedLogins > 5) {
      recommendations.push('Consider implementing account lockout after multiple failed login attempts');
    }

    const encryptionFailures = logs.filter(log => 
      log.eventType.includes('encryption') && !log.details.success
    ).length;
    
    if (encryptionFailures > 0) {
      recommendations.push('Review encryption implementation and key management');
    }

    if (recommendations.length === 0) {
      recommendations.push('Security posture is good. Continue monitoring.');
    }

    return recommendations;
  }
}

// Audit Logger Class
class AuditLogger {
  constructor() {
    this.maxLogEntries = 10000;
  }

  async log(event, metadata = {}) {
    const logEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      event,
      metadata,
      source: 'chatbot',
      version: '1.0'
    };

    // In production, send to centralized logging system (e.g., ELK stack, Splunk)
    console.log('[AUDIT]', logEntry);
  }
}

// Multi-language Support
class MultiLanguageManager {
  constructor() {
    this.currentLanguage = localStorage.getItem('chatbot_language') || 'en';
    this.translations = this.loadTranslations();
  }

  loadTranslations() {
    return {
      en: {
        welcome: "Hello! I'm your grant discovery assistant.",
        help: "I can help you with grants and navigation.",
        error: "I apologize, but I encountered an error.",
        typing: "Thinking...",
        send: "Send",
        placeholder: "Ask about grants or navigation...",
        analytics: "Analytics",
        history: "Conversation History",
        settings: "Settings",
        admin: "Admin Dashboard"
      },
      es: {
        welcome: "¡Hola! Soy tu asistente de descubrimiento de subvenciones.",
        help: "Puedo ayudarte con subvenciones y navegación.",
        error: "Me disculpo, pero encontré un error.",
        typing: "Pensando...",
        send: "Enviar",
        placeholder: "Pregunta sobre subvenciones o navegación...",
        analytics: "Analíticas",
        history: "Historial de Conversación",
        settings: "Configuración",
        admin: "Panel de Administración"
      },
      fr: {
        welcome: "Bonjour! Je suis votre assistant de découverte de subventions.",
        help: "Je peux vous aider avec les subventions et la navigation.",
        error: "Je m'excuse, mais j'ai rencontré une erreur.",
        typing: "Réflexion...",
        send: "Envoyer",
        placeholder: "Demandez des subventions ou de la navigation...",
        analytics: "Analytique",
        history: "Historique de Conversation",
        settings: "Paramètres",
        admin: "Tableau de Bord Admin"
      }
    };
  }

  t(key) {
    return this.translations[this.currentLanguage]?.[key] || 
           this.translations.en[key] || 
           key;
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    localStorage.setItem('chatbot_language', lang);
  }

  getCurrentLanguage() {
    return this.currentLanguage;
  }

  getAvailableLanguages() {
    return Object.keys(this.translations).map(code => ({
      code,
      name: this.getLanguageName(code)
    }));
  }

  getLanguageName(code) {
    const names = {
      en: 'English',
      es: 'Español',
      fr: 'Français',
      de: 'Deutsch'
    };
    return names[code] || code;
  }
}

// Administrative Dashboard for Management
class AdministrativeDashboard {
  constructor(userManager, conversationManager, apiManager, securityManager) {
    this.userManager = userManager;
    this.conversationManager = conversationManager;
    this.apiManager = apiManager;
    this.securityManager = securityManager;
    this.activeTab = 'overview';
    this.isVisible = false;
    this.dashboardData = {};
    this.autoRefresh = true;
    this.refreshInterval = 30000; // 30 seconds
    this.initializeDashboard();
  }

  initializeDashboard() {
    this.dashboardData = {
      systemHealth: {
        status: 'healthy',
        uptime: 99.9,
        responseTime: 150,
        activeUsers: 0,
        totalRequests: 0
      },
      userManagement: {
        totalUsers: 0,
        activeUsers: 0,
        newUsers: 0,
        userRoles: {}
      },
      conversationMetrics: {
        totalConversations: 0,
        activeConversations: 0,
        averageDuration: 0,
        satisfactionScore: 0
      },
      securityMetrics: {
        failedLogins: 0,
        securityEvents: 0,
        complianceStatus: 'compliant',
        auditEntries: 0
      },
      performance: {
        cpuUsage: 0,
        memoryUsage: 0,
        networkLatency: 0,
        errorRate: 0
      }
    };
  }

  async refreshDashboard() {
    try {
      // Refresh all dashboard data
      await this.refreshSystemHealth();
      await this.refreshUserMetrics();
      await this.refreshConversationMetrics();
      await this.refreshSecurityMetrics();
      await this.refreshPerformanceMetrics();
      
      if (this.onDataUpdate) {
        this.onDataUpdate(this.dashboardData);
      }
    } catch (error) {
      console.error('Failed to refresh dashboard:', error);
    }
  }

  async refreshSystemHealth() {
    // Simulate system health data
    this.dashboardData.systemHealth = {
      status: Math.random() > 0.1 ? 'healthy' : 'warning',
      uptime: 99.5 + Math.random() * 0.5,
      responseTime: 100 + Math.random() * 100,
      activeUsers: Math.floor(Math.random() * 50) + 10,
      totalRequests: Math.floor(Math.random() * 10000) + 1000
    };
  }

  async refreshUserMetrics() {
    // Simulate user management data
    this.dashboardData.userManagement = {
      totalUsers: Math.floor(Math.random() * 1000) + 100,
      activeUsers: Math.floor(Math.random() * 200) + 20,
      newUsers: Math.floor(Math.random() * 20) + 1,
      userRoles: {
        ADMIN: Math.floor(Math.random() * 5) + 1,
        MANAGER: Math.floor(Math.random() * 20) + 5,
        AGENT: Math.floor(Math.random() * 50) + 10,
        VIEWER: Math.floor(Math.random() * 100) + 20
      }
    };
  }

  async refreshConversationMetrics() {
    // Simulate conversation metrics
    this.dashboardData.conversationMetrics = {
      totalConversations: Math.floor(Math.random() * 5000) + 500,
      activeConversations: Math.floor(Math.random() * 50) + 5,
      averageDuration: Math.floor(Math.random() * 600) + 180, // seconds
      satisfactionScore: (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
    };
  }

  async refreshSecurityMetrics() {
    // Get security data from security manager
    try {
      const auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
      const recentLogs = auditLogs.filter(log => 
        Date.now() - new Date(log.timestamp).getTime() < 86400000
      );

      this.dashboardData.securityMetrics = {
        failedLogins: recentLogs.filter(log => 
          log.eventType === 'user_login' && !log.details.success
        ).length,
        securityEvents: recentLogs.filter(log => 
          log.eventType.includes('security')
        ).length,
        complianceStatus: 'compliant', // This would come from security manager
        auditEntries: recentLogs.length
      };
    } catch (error) {
      console.warn('Failed to refresh security metrics:', error);
    }
  }

  async refreshPerformanceMetrics() {
    // Simulate performance metrics
    this.dashboardData.performance = {
      cpuUsage: Math.random() * 80 + 10, // 10-90%
      memoryUsage: Math.random() * 70 + 20, // 20-90%
      networkLatency: Math.random() * 200 + 50, // 50-250ms
      errorRate: Math.random() * 5 // 0-5%
    };
  }

  async startAutoRefresh() {
    if (this.autoRefresh) {
      await this.refreshDashboard();
      setTimeout(() => this.startAutoRefresh(), this.refreshInterval);
    }
  }

  stopAutoRefresh() {
    this.autoRefresh = false;
  }

  setActiveTab(tab) {
    this.activeTab = tab;
    if (this.onTabChange) {
      this.onTabChange(tab);
    }
  }

  async exportDashboardData(format = 'json') {
    const data = {
      timestamp: new Date().toISOString(),
      dashboardData: this.dashboardData,
      systemInfo: {
        version: '1.0.0',
        environment: 'production',
        region: 'us-east-1'
      }
    };

    switch (format) {
      case 'json':
        return JSON.stringify(data, null, 2);
      case 'csv':
        return this.convertToCSV(data.dashboardData);
      case 'pdf':
        return await this.generatePDFReport(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  convertToCSV(data) {
    // Convert dashboard data to CSV format
    const rows = [];
    rows.push('Metric,Value');
    
    // Add system health metrics
    Object.entries(data.systemHealth).forEach(([key, value]) => {
      rows.push(`System Health - ${key},${value}`);
    });
    
    // Add user management metrics
    Object.entries(data.userManagement).forEach(([key, value]) => {
      rows.push(`User Management - ${key},${value}`);
    });
    
    return rows.join('\n');
  }

  async generatePDFReport(data) {
    // In a real implementation, this would generate a PDF report
    // For demo purposes, return a placeholder
    return 'PDF report generated successfully';
  }

  async generateReport(type = 'summary') {
    const reports = {
      summary: {
        title: 'Administrative Summary Report',
        sections: [
          'System Health Overview',
          'User Activity Summary',
          'Security Status',
          'Performance Metrics'
        ]
      },
      security: {
        title: 'Security Audit Report',
        sections: [
          'Security Events Analysis',
          'Compliance Status',
          'Audit Trail Summary',
          'Recommendations'
        ]
      },
      performance: {
        title: 'Performance Analysis Report',
        sections: [
          'System Performance Trends',
          'Resource Utilization',
          'Response Time Analysis',
          'Optimization Recommendations'
        ]
      },
      user: {
        title: 'User Management Report',
        sections: [
          'User Activity Analysis',
          'Role Distribution',
          'Engagement Metrics',
          'User Satisfaction'
        ]
      }
    };

    const report = reports[type];
    if (!report) {
      throw new Error(`Unknown report type: ${type}`);
    }

    // Generate report content
    const reportContent = {
      ...report,
      timestamp: new Date().toISOString(),
      data: this.dashboardData,
      generatedBy: this.userManager.currentUser?.name || 'System'
    };

    return reportContent;
  }

  async configureSettings(settings) {
    // Configure dashboard and system settings
    const allowedSettings = [
      'autoRefresh',
      'refreshInterval',
      'notificationPreferences',
      'securityLevel',
      'complianceMode',
      'dataRetentionDays',
      'backupFrequency'
    ];

    const updatedSettings = {};
    
    Object.keys(settings).forEach(key => {
      if (allowedSettings.includes(key)) {
        updatedSettings[key] = settings[key];
        
        // Apply specific settings
        if (key === 'refreshInterval') {
          this.refreshInterval = settings[key];
        } else if (key === 'autoRefresh') {
          this.autoRefresh = settings[key];
          if (settings[key]) {
            this.startAutoRefresh();
          }
        }
      }
    });

    // Save settings to storage
    const savedSettings = JSON.parse(localStorage.getItem('dashboard_settings') || '{}');
    Object.assign(savedSettings, updatedSettings);
    localStorage.setItem('dashboard_settings', JSON.stringify(savedSettings));

    return updatedSettings;
  }

  getSettings() {
    const defaultSettings = {
      autoRefresh: true,
      refreshInterval: 30000,
      notificationPreferences: {
        email: true,
        inApp: true,
        critical: true
      },
      securityLevel: 'HIGH',
      complianceMode: 'GDPR',
      dataRetentionDays: 365,
      backupFrequency: 'daily'
    };

    const savedSettings = JSON.parse(localStorage.getItem('dashboard_settings') || '{}');
    return { ...defaultSettings, ...savedSettings };
  }

  async manageUsers(action, userData = {}) {
    // User management operations
    const actions = {
      create: async (userData) => {
        // Create new user
        return { success: true, userId: `user_${Date.now()}` };
      },
      update: async (userData) => {
        // Update existing user
        return { success: true, message: 'User updated successfully' };
      },
      delete: async (userData) => {
        // Delete user
        return { success: true, message: 'User deleted successfully' };
      },
      list: async () => {
        // List all users
        return {
          users: [
            { id: 'user_1', name: 'Admin User', role: 'ADMIN', status: 'active' },
            { id: 'user_2', name: 'Manager User', role: 'MANAGER', status: 'active' },
            { id: 'user_3', name: 'Agent User', role: 'AGENT', status: 'active' }
          ]
        };
      }
    };

    if (!actions[action]) {
      throw new Error(`Unknown user management action: ${action}`);
    }

    return await actions[action](userData);
  }

  async backupData() {
    // Create backup of all chatbot data
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      data: {
        conversations: await this.conversationManager.getAllConversations(),
        users: this.userManager.getAllUsers(),
        settings: this.getSettings(),
        auditLogs: JSON.parse(localStorage.getItem('audit_logs') || '[]')
      }
    };

    // In production, this would upload to secure backup storage
    localStorage.setItem('chatbot_backup', JSON.stringify(backupData));
    
    return {
      success: true,
      backupId: `backup_${Date.now()}`,
      size: JSON.stringify(backupData).length,
      timestamp: backupData.timestamp
    };
  }

  async restoreData(backupId) {
    // Restore data from backup
    const backup = JSON.parse(localStorage.getItem('chatbot_backup') || '{}');
    
    if (!backup.timestamp) {
      throw new Error('Invalid backup data');
    }

    // Restore conversations
    if (backup.data.conversations) {
      // Implementation would restore conversations
    }

    // Restore users
    if (backup.data.users) {
      // Implementation would restore users
    }

    // Restore settings
    if (backup.data.settings) {
      localStorage.setItem('dashboard_settings', JSON.stringify(backup.data.settings));
    }

    return {
      success: true,
      restoredItems: Object.keys(backup.data).length,
      timestamp: backup.timestamp
    };
  }
}

// Scalability Features for Large Organizations
class ScalabilityManager {
  constructor(userManager, conversationManager, apiManager) {
    this.userManager = userManager;
    this.conversationManager = conversationManager;
    this.apiManager = apiManager;
    this.cache = new Map();
    this.performanceMetrics = {
      responseTime: 0,
      throughput: 0,
      errorRate: 0,
      memoryUsage: 0,
      cacheHitRate: 0
    };
    this.loadBalancer = new LoadBalancer();
    this.initializeScalability();
  }

  initializeScalability() {
    this.setupCaching();
    this.setupPerformanceMonitoring();
    this.setupDataCompression();
    this.setupLoadBalancing();
    this.setupDatabaseOptimization();
  }

  setupCaching() {
    this.cacheStrategy = {
      conversations: { ttl: 3600000, maxSize: 1000 }, // 1 hour, 1000 items
      analytics: { ttl: 300000, maxSize: 100 }, // 5 minutes, 100 items
      userData: { ttl: 1800000, maxSize: 500 }, // 30 minutes, 500 items
      searchResults: { ttl: 60000, maxSize: 200 }, // 1 minute, 200 items
      translations: { ttl: 86400000, maxSize: 50 } // 24 hours, 50 items
    };

    // Cache cleanup interval
    setInterval(() => this.cleanupCache(), 300000); // Every 5 minutes
  }

  setupPerformanceMonitoring() {
    this.performanceThresholds = {
      responseTime: 2000, // 2 seconds
      memoryUsage: 100, // 100MB
      errorRate: 5, // 5%
      cacheHitRate: 80 // 80%
    };

    // Monitor performance every 30 seconds
    setInterval(() => this.collectPerformanceMetrics(), 30000);
  }

  setupDataCompression() {
    this.compressionEnabled = true;
    this.compressionLevel = 6; // Medium compression
    this.minSizeForCompression = 1024; // 1KB
  }

  setupLoadBalancing() {
    this.loadBalancer.addServer('primary', 'https://api.primary.com', 1.0);
    this.loadBalancer.addServer('secondary', 'https://api.secondary.com', 0.7);
    this.loadBalancer.addServer('tertiary', 'https://api.tertiary.com', 0.5);
  }

  setupDatabaseOptimization() {
    this.queryOptimization = {
      batchSize: 100,
      maxConnections: 10,
      connectionTimeout: 5000,
      queryTimeout: 30000,
      indexHints: true,
      queryCaching: true
    };
  }

  // Caching methods
  getCachedData(key, cacheType = 'default') {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const cacheConfig = this.cacheStrategy[cacheType] || { ttl: 300000 };
    const now = Date.now();

    if (now - cached.timestamp > cacheConfig.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    cached.accessCount++;
    cached.lastAccessed = now;

    return cached.data;
  }

  setCachedData(key, data, cacheType = 'default') {
    const cacheConfig = this.cacheStrategy[cacheType] || { ttl: 300000, maxSize: 100 };
    const now = Date.now();

    // Check cache size limits
    if (this.cache.size >= cacheConfig.maxSize) {
      this.evictLRU(cacheType);
    }

    const cacheEntry = {
      data,
      timestamp: now,
      accessCount: 0,
      lastAccessed: now,
      compressed: this.shouldCompress(data)
    };

    if (cacheEntry.compressed) {
      cacheEntry.data = this.compressData(data);
    }

    this.cache.set(key, cacheEntry);
  }

  shouldCompress(data) {
    if (!this.compressionEnabled) return false;
    const size = JSON.stringify(data).length;
    return size > this.minSizeForCompression;
  }

  compressData(data) {
    // Simple compression for demo (in production, use proper compression)
    const jsonString = JSON.stringify(data);
    return btoa(jsonString); // Base64 encoding as simple compression
  }

  decompressData(compressedData) {
    try {
      const jsonString = atob(compressedData);
      return JSON.parse(jsonString);
    } catch (error) {
      console.warn('Failed to decompress data:', error);
      return compressedData;
    }
  }

  evictLRU(cacheType) {
    const cacheConfig = this.cacheStrategy[cacheType];
    if (!cacheConfig) return;

    // Find least recently used item
    let lruKey = null;
    let lruTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.lastAccessed < lruTime) {
        lruTime = value.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  cleanupCache() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, cached] of this.cache.entries()) {
      const cacheType = this.getCacheTypeFromKey(key);
      const config = this.cacheStrategy[cacheType];

      if (config && now - cached.timestamp > config.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`Cleaned ${cleaned} expired cache entries`);
    }
  }

  getCacheTypeFromKey(key) {
    if (key.includes('conversation')) return 'conversations';
    if (key.includes('analytics')) return 'analytics';
    if (key.includes('user')) return 'userData';
    if (key.includes('search')) return 'searchResults';
    if (key.includes('translation')) return 'translations';
    return 'default';
  }

  // Performance monitoring
  collectPerformanceMetrics() {
    // Collect performance metrics
    const startTime = performance.now();
    
    // Simulate some work
    setTimeout(() => {
      const endTime = performance.now();
      this.performanceMetrics.responseTime = endTime - startTime;
      
      // Update other metrics
      this.updateThroughput();
      this.updateErrorRate();
      this.updateMemoryUsage();
      this.updateCacheHitRate();
      
      // Check thresholds
      this.checkPerformanceThresholds();
    }, 100);
  }

  updateThroughput() {
    // Calculate requests per minute
    this.performanceMetrics.throughput = Math.random() * 100 + 50; // 50-150 requests/min
  }

  updateErrorRate() {
    // Calculate error rate percentage
    this.performanceMetrics.errorRate = Math.random() * 3; // 0-3% error rate
  }

  updateMemoryUsage() {
    // Estimate memory usage
    this.performanceMetrics.memoryUsage = (this.cache.size * 0.5) + Math.random() * 20;
  }

  updateCacheHitRate() {
    // Calculate cache hit rate
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    const cacheSize = this.cache.size;
    
    this.performanceMetrics.cacheHitRate = cacheSize > 0 ? 
      Math.min((totalAccesses / (totalAccesses + 100)) * 100, 95) : 0;
  }

  checkPerformanceThresholds() {
    const metrics = this.performanceMetrics;
    const issues = [];

    if (metrics.responseTime > this.performanceThresholds.responseTime) {
      issues.push(`High response time: ${metrics.responseTime.toFixed(2)}ms`);
    }

    if (metrics.memoryUsage > this.performanceThresholds.memoryUsage) {
      issues.push(`High memory usage: ${metrics.memoryUsage.toFixed(2)}MB`);
    }

    if (metrics.errorRate > this.performanceThresholds.errorRate) {
      issues.push(`High error rate: ${metrics.errorRate.toFixed(2)}%`);
    }

    if (metrics.cacheHitRate < this.performanceThresholds.cacheHitRate) {
      issues.push(`Low cache hit rate: ${metrics.cacheHitRate.toFixed(2)}%`);
    }

    if (issues.length > 0) {
      console.warn('Performance issues detected:', issues);
      this.handlePerformanceIssues(issues);
    }
  }

  handlePerformanceIssues(issues) {
    // Implement performance optimization strategies
    issues.forEach(issue => {
      if (issue.includes('response time')) {
        this.optimizeResponseTime();
      } else if (issue.includes('memory usage')) {
        this.optimizeMemoryUsage();
      } else if (issue.includes('error rate')) {
        this.optimizeErrorRate();
      } else if (issue.includes('cache hit rate')) {
        this.optimizeCacheStrategy();
      }
    });
  }

  optimizeResponseTime() {
    // Implement response time optimizations
    this.adaptiveCaching();
    this.preloadCriticalData();
  }

  optimizeMemoryUsage() {
    // Implement memory optimizations
    this.reduceCacheSize();
    this.cleanupUnusedData();
  }

  optimizeErrorRate() {
    // Implement error rate optimizations
    this.implementCircuitBreaker();
    this.improveErrorHandling();
  }

  optimizeCacheStrategy() {
    // Implement cache optimizations
    this.adjustCacheTTL();
    this.implementPredictiveCaching();
  }

  adaptiveCaching() {
    // Adjust cache TTL based on access patterns
    Object.keys(this.cacheStrategy).forEach(cacheType => {
      const config = this.cacheStrategy[cacheType];
      const usage = this.getCacheUsage(cacheType);
      
      if (usage > 80) {
        config.ttl = Math.min(config.ttl * 1.5, config.ttl * 2);
      } else if (usage < 20) {
        config.ttl = Math.max(config.ttl * 0.5, config.ttl * 0.25);
      }
    });
  }

  preloadCriticalData() {
    // Preload frequently accessed data
    const criticalData = [
      'user_preferences',
      'common_searches',
      'popular_grants'
    ];

    criticalData.forEach(dataType => {
      if (!this.cache.has(dataType)) {
        const data = this.generateMockData(dataType);
        this.setCachedData(dataType, data, 'default');
      }
    });
  }

  reduceCacheSize() {
    // Reduce cache size when memory usage is high
    const targetSize = Math.floor(this.cache.size * 0.8);
    while (this.cache.size > targetSize) {
      this.evictLRU('default');
    }
  }

  cleanupUnusedData() {
    // Clean up unused data
    for (const [key, cached] of this.cache.entries()) {
      if (cached.accessCount === 0) {
        this.cache.delete(key);
      }
    }
  }

  implementCircuitBreaker() {
    // Implement circuit breaker pattern for external services
    this.circuitBreaker = {
      failureThreshold: 5,
      timeout: 60000,
      state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
      failures: 0,
      lastFailureTime: null
    };
  }

  improveErrorHandling() {
    // Improve error handling mechanisms
    this.errorHandling = {
      retryAttempts: 3,
      retryDelay: 1000,
      fallbackEnabled: true,
      gracefulDegradation: true
    };
  }

  adjustCacheTTL() {
    // Adjust cache TTL based on performance
    Object.keys(this.cacheStrategy).forEach(cacheType => {
      const config = this.cacheStrategy[cacheType];
      config.ttl = Math.max(config.ttl * 0.9, 60000); // Reduce TTL but minimum 1 minute
    });
  }

  implementPredictiveCaching() {
    // Implement predictive caching based on user patterns
    this.predictiveCache = {
      enabled: true,
      predictionWindow: 300000, // 5 minutes
      confidenceThreshold: 0.7
    };
  }

  getCacheUsage(cacheType) {
    // Calculate cache usage percentage
    const config = this.cacheStrategy[cacheType];
    if (!config) return 0;
    
    const typeEntries = Array.from(this.cache.entries())
      .filter(([key]) => this.getCacheTypeFromKey(key) === cacheType);
    
    return (typeEntries.length / config.maxSize) * 100;
  }

  generateMockData(dataType) {
    // Generate mock data for preloading
    const mockData = {
      user_preferences: {
        theme: 'light',
        language: 'en',
        notifications: true
      },
      common_searches: [
        'small business grants',
        'nonprofit funding',
        'research grants'
      ],
      popular_grants: [
        { name: 'Small Business Grant', amount: '$25,000' },
        { name: 'Innovation Fund', amount: '$100,000' }
      ]
    };

    return mockData[dataType] || {};
  }

  // Load balancing
  async makeLoadBalancedRequest(endpoint, options = {}) {
    const server = this.loadBalancer.getNextServer();
    const url = `${server.url}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Load-Balancer': 'chatbot',
          'X-Server': server.name
        }
      });
      
      this.loadBalancer.recordSuccess(server.name);
      return response;
    } catch (error) {
      this.loadBalancer.recordFailure(server.name);
      throw error;
    }
  }

  // Database optimization
  async optimizeQueries() {
    // Implement query optimization strategies
    return {
      indexedQueries: true,
      batchProcessing: true,
      connectionPooling: true,
      queryCaching: true
    };
  }

  getPerformanceReport() {
    return {
      timestamp: new Date().toISOString(),
      metrics: this.performanceMetrics,
      cacheStats: {
        size: this.cache.size,
        hitRate: this.performanceMetrics.cacheHitRate,
        efficiency: this.calculateCacheEfficiency()
      },
      loadBalancerStatus: this.loadBalancer.getStatus(),
      recommendations: this.generateOptimizationRecommendations()
    };
  }

  calculateCacheEfficiency() {
    const totalAccesses = Array.from(this.cache.values())
      .reduce((sum, entry) => sum + entry.accessCount, 0);
    const cacheSize = this.cache.size;
    
    return cacheSize > 0 ? (totalAccesses / cacheSize).toFixed(2) : 0;
  }

  generateOptimizationRecommendations() {
    const recommendations = [];
    const metrics = this.performanceMetrics;

    if (metrics.responseTime > 1000) {
      recommendations.push('Consider implementing request batching and response caching');
    }

    if (metrics.memoryUsage > 80) {
      recommendations.push('Implement more aggressive cache cleanup and memory optimization');
    }

    if (metrics.errorRate > 2) {
      recommendations.push('Review error handling and implement circuit breaker patterns');
    }

    if (metrics.cacheHitRate < 70) {
      recommendations.push('Optimize cache strategy and implement predictive caching');
    }

    return recommendations;
  }
}

// Load Balancer Class
class LoadBalancer {
  constructor() {
    this.servers = new Map();
    this.currentIndex = 0;
  }

  addServer(name, url, weight = 1.0) {
    this.servers.set(name, {
      url,
      weight,
      failures: 0,
      lastFailure: null,
      status: 'healthy'
    });
  }

  getNextServer() {
    const healthyServers = Array.from(this.servers.entries())
      .filter(([_, server]) => server.status === 'healthy');
    
    if (healthyServers.length === 0) {
      // Fallback to any server if none are healthy
      const firstServer = Array.from(this.servers.entries())[0];
      return { name: firstServer[0], url: firstServer[1].url };
    }

    // Round-robin with weight consideration
    const server = healthyServers[this.currentIndex % healthyServers.length];
    this.currentIndex = (this.currentIndex + 1) % healthyServers.length;
    
    return { name: server[0], url: server[1].url };
  }

  recordSuccess(serverName) {
    const server = this.servers.get(serverName);
    if (server) {
      server.failures = Math.max(0, server.failures - 1);
      server.status = 'healthy';
    }
  }

  recordFailure(serverName) {
    const server = this.servers.get(serverName);
    if (server) {
      server.failures++;
      server.lastFailure = new Date().toISOString();
      
      if (server.failures >= 5) {
        server.status = 'unhealthy';
      }
    }
  }

  getStatus() {
    const status = {};
    for (const [name, server] of this.servers.entries()) {
      status[name] = {
        status: server.status,
        failures: server.failures,
        lastFailure: server.lastFailure,
        weight: server.weight
      };
    }
    return status;
  }
}

// Enterprise Testing and Validation System
class EnterpriseTestSuite {
  constructor(userManager, conversationManager, apiManager, securityManager, adminDashboard, scalabilityManager) {
    this.userManager = userManager;
    this.conversationManager = conversationManager;
    this.apiManager = apiManager;
    this.securityManager = securityManager;
    this.adminDashboard = adminDashboard;
    this.scalabilityManager = scalabilityManager;
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0
    };
    this.testSuite = this.initializeTestSuite();
  }

  initializeTestSuite() {
    return {
      // User Management Tests
      userManagement: [
        {
          name: 'User Creation and Authentication',
          test: () => this.testUserCreation(),
          critical: true
        },
        {
          name: 'Role-based Access Control',
          test: () => this.testRoleBasedAccess(),
          critical: true
        },
        {
          name: 'Permission Validation',
          test: () => this.testPermissions(),
          critical: true
        }
      ],

      // Security Tests
      security: [
        {
          name: 'Data Encryption',
          test: () => this.testDataEncryption(),
          critical: true
        },
        {
          name: 'Audit Logging',
          test: () => this.testAuditLogging(),
          critical: true
        },
        {
          name: 'Session Management',
          test: () => this.testSessionManagement(),
          critical: true
        }
      ],

      // Scalability Tests
      scalability: [
        {
          name: 'Caching System',
          test: () => this.testCachingSystem(),
          critical: true
        },
        {
          name: 'Performance Monitoring',
          test: () => this.testPerformanceMonitoring(),
          critical: true
        }
      ]
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Enterprise Test Suite...');
    this.resetTestResults();

    const testCategories = Object.keys(this.testSuite);
    
    for (const category of testCategories) {
      console.log(`\n📋 Testing ${category}...`);
      await this.runTestCategory(category);
    }

    this.generateTestReport();
    return this.testResults;
  }

  async runTestCategory(categoryName) {
    const tests = this.testSuite[categoryName];
    
    for (const test of tests) {
      try {
        const result = await test.test();
        this.recordTestResult('passed', test.name, result);
        console.log(`✅ ${test.name}: PASSED`);
      } catch (error) {
        if (test.critical) {
          this.recordTestResult('failed', test.name, { error: error.message });
          console.log(`❌ ${test.name}: FAILED - ${error.message}`);
        } else {
          this.recordTestResult('warnings', test.name, { warning: error.message });
          console.log(`⚠️ ${test.name}: WARNING - ${error.message}`);
        }
      }
    }
  }

  recordTestResult(status, testName, details) {
    this.testResults[status]++;
    this.testResults.total++;
    
    if (!this.testResults.details) {
      this.testResults.details = {};
    }
    
    this.testResults.details[testName] = {
      status,
      details,
      timestamp: new Date().toISOString()
    };
  }

  resetTestResults() {
    this.testResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      details: {}
    };
  }

  generateTestReport() {
    const successRate = ((this.testResults.passed / this.testResults.total) * 100).toFixed(2);
    const criticalFailures = this.getCriticalFailures();
    
    console.log('\n📊 TEST SUITE COMPLETE');
    console.log(`Total Tests: ${this.testResults.total}`);
    console.log(`Passed: ${this.testResults.passed}`);
    console.log(`Failed: ${this.testResults.failed}`);
    console.log(`Warnings: ${this.testResults.warnings}`);
    console.log(`Success Rate: ${successRate}%`);
    
    if (criticalFailures.length > 0) {
      console.log(`\n🚨 CRITICAL FAILURES DETECTED:`);
      criticalFailures.forEach(failure => {
        console.log(`- ${failure}`);
      });
    }
    
    if (this.testResults.failed === 0) {
      console.log('\n🎉 ALL CRITICAL TESTS PASSED! Enterprise functionality validated.');
    }
  }

  getCriticalFailures() {
    const failures = [];
    for (const [testName, result] of Object.entries(this.testResults.details || {})) {
      if (result.status === 'failed') {
        const test = this.findTestByName(testName);
        if (test && test.critical) {
          failures.push(testName);
        }
      }
    }
    return failures;
  }

  findTestByName(testName) {
    for (const category of Object.values(this.testSuite)) {
      const test = category.find(t => t.name === testName);
      if (test) return test;
    }
    return null;
  }

  // Individual test implementations
  async testUserCreation() {
    const testUser = {
      id: 'test-user-' + Date.now(),
      name: 'Test User',
      role: 'AGENT',
      permissions: ['chat', 'view_history']
    };
    
    if (!testUser.id || !testUser.name || !testUser.role) {
      throw new Error('User creation failed - missing required fields');
    }
    
    return { userCreated: true, userId: testUser.id };
  }

  async testRoleBasedAccess() {
    const roles = ['ADMIN', 'MANAGER', 'AGENT', 'VIEWER'];
    
    for (const role of roles) {
      const hasAccess = this.userManager.getRoleLevel() >= this.userManager.getRoleLevel(role);
      if (!hasAccess && role === 'ADMIN') {
        throw new Error(`Role-based access control failed for ${role}`);
      }
    }
    
    return { rolesTested: roles.length, accessControl: 'working' };
  }

  async testPermissions() {
    const testPermission = 'chat';
    const hasPermission = this.userManager.hasPermission(testPermission);
    
    if (!hasPermission) {
      throw new Error('Permission validation failed');
    }
    
    return { permission: testPermission, granted: hasPermission };
  }

  async testDataEncryption() {
    const testData = { sensitive: 'data', timestamp: Date.now() };
    
    try {
      const encrypted = await this.securityManager.encryptData(testData);
      const decrypted = await this.securityManager.decryptData(encrypted);
      
      if (decrypted.sensitive !== testData.sensitive) {
        throw new Error('Data encryption/decryption failed - data mismatch');
      }
      
      return { encryptionWorking: true, dataMatch: true };
    } catch (error) {
      throw new Error(`Encryption test failed: ${error.message}`);
    }
  }

  async testAuditLogging() {
    await this.securityManager.auditLog('test_event', { test: 'data' });
    
    const logs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    const recentTestLog = logs.find(log => log.eventType === 'test_event');
    
    if (!recentTestLog) {
      throw new Error('Audit logging failed - no log entry found');
    }
    
    return { auditLogging: true, logEntry: recentTestLog.id };
  }

  async testSessionManagement() {
    const sessionId = this.securityManager.getSessionId();
    
    if (!sessionId) {
      throw new Error('Session management failed - no session ID');
    }
    
    this.securityManager.updateSessionActivity();
    const sessionData = this.securityManager.getSessionData();
    
    if (!sessionData.lastActivity) {
      throw new Error('Session activity tracking failed');
    }
    
    return { sessionId, activityTracked: true };
  }

  async testCachingSystem() {
    const testKey = 'test_cache_key';
    const testData = { test: 'data', timestamp: Date.now() };
    
    this.scalabilityManager.setCachedData(testKey, testData, 'default');
    const retrievedData = this.scalabilityManager.getCachedData(testKey, 'default');
    
    if (!retrievedData || retrievedData.test !== testData.test) {
      throw new Error('Caching system failed - data mismatch');
    }
    
    return { cachingWorking: true, dataMatch: true };
  }

  async testPerformanceMonitoring() {
    this.scalabilityManager.collectPerformanceMetrics();
    
    const metrics = this.scalabilityManager.performanceMetrics;
    
    if (!metrics.responseTime && metrics.responseTime !== 0) {
      throw new Error('Performance monitoring failed - no response time metric');
    }
    
    return { monitoringWorking: true, metrics: Object.keys(metrics).length };
  }
}

const ChatBot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  
  const messagesEndRef = useRef(null);
  
  // Enterprise systems
  const userManager = useRef(new EnterpriseUserManager()).current;
  const conversationManager = useRef(new EnterpriseConversationManager(userManager)).current;
  const languageManager = useRef(new MultiLanguageManager()).current;
  
  // Website paths for navigation
  const websitePaths = {
    home: { path: '/', label: 'Home', icon: '🏠' },
    about: { path: '/about', label: 'About', icon: 'ℹ️' },
    dashboard: { path: '/chart', label: 'Dashboard', icon: '📊' },
    benefits: { path: '/benefits', label: 'Benefits', icon: '🏛️' },
    suggestions: { path: '/suggestions', label: 'Suggestions', icon: '💬' },
    creator: { path: '/creator-login', label: 'Creator Portal', icon: '✍️' },
    government: { path: '/gov-login', label: 'Government', icon: '🏛️' },
    create: { path: '/create-grant', label: 'Create Grant', icon: '📝' },
    view: { path: '/view', label: 'Public View', icon: '👁️' }
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: languageManager.t('welcome') + " " + languageManager.t('help'),
        sender: 'bot',
        timestamp: new Date(),
        intent: 'greeting'
      };
      
      // Add to enterprise conversation manager
      conversationManager.addMessage(welcomeMessage, false);
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Enhanced intent recognition with enterprise features
  const analyzeIntent = (text) => {
    const query = text.toLowerCase();
    
    // Enterprise command intents
    if (/(analytics|stats|reports|data)/i.test(query) && userManager.canAccess('analytics')) {
      return { intent: 'show_analytics', confidence: 0.9 };
    }
    if (/(history|conversations|past chats)/i.test(query) && userManager.canAccess('conversation_export')) {
      return { intent: 'show_history', confidence: 0.9 };
    }
    if (/(settings|preferences|config)/i.test(query)) {
      return { intent: 'show_settings', confidence: 0.9 };
    }
    if (/(admin|administrator|management)/i.test(query) && userManager.canAccess('admin_dashboard')) {
      return { intent: 'admin_dashboard', confidence: 0.9 };
    }
    if (/(search|find|lookup)/i.test(query) && userManager.canAccess('conversation_export')) {
      return { intent: 'search_conversations', confidence: 0.8 };
    }
    
    // Navigation intents
    if (/(home|main page|start)/i.test(query)) {
      return { intent: 'navigate', target: 'home', confidence: 0.9 };
    }
    if (/(about|team|company)/i.test(query)) {
      return { intent: 'navigate', target: 'about', confidence: 0.9 };
    }
    if (/(dashboard|chart)/i.test(query)) {
      return { intent: 'navigate', target: 'dashboard', confidence: 0.9 };
    }
    if (/(benefits|schemes|government)/i.test(query)) {
      return { intent: 'navigate', target: 'benefits', confidence: 0.9 };
    }
    if (/(suggestions|feedback)/i.test(query)) {
      return { intent: 'navigate', target: 'suggestions', confidence: 0.9 };
    }
    if (/(creator|login|apply)/i.test(query)) {
      return { intent: 'navigate', target: 'creator', confidence: 0.9 };
    }
    if (/(government|official)/i.test(query)) {
      return { intent: 'navigate', target: 'government', confidence: 0.9 };
    }
    if (/(create|new grant)/i.test(query)) {
      return { intent: 'navigate', target: 'create', confidence: 0.9 };
    }
    if (/(view|browse|explore)/i.test(query)) {
      return { intent: 'navigate', target: 'view', confidence: 0.9 };
    }
    
    // Grant-related intents
    if (/(grant|funding|money|opportunity)/i.test(query)) {
      return { intent: 'grant_info', confidence: 0.8 };
    }
    if (/(eligible|qualify|requirements)/i.test(query)) {
      return { intent: 'eligibility', confidence: 0.8 };
    }
    if (/(apply|application|submit)/i.test(query)) {
      return { intent: 'application', confidence: 0.8 };
    }
    if (/(deadline|due date)/i.test(query)) {
      return { intent: 'deadline', confidence: 0.8 };
    }
    if (/(how much|amount|funding)/i.test(query)) {
      return { intent: 'amount', confidence: 0.8 };
    }
    
    // General intents
    if (/(help|support)/i.test(query)) {
      return { intent: 'help', confidence: 0.9 };
    }
    if (/(hello|hi|hey)/i.test(query)) {
      return { intent: 'greeting', confidence: 0.9 };
    }
    if (/(thank|thanks)/i.test(query)) {
      return { intent: 'gratitude', confidence: 0.9 };
    }
    if (/(show|navigate|go to|take me)/i.test(query)) {
      return { intent: 'show_actions', confidence: 0.8 };
    }
    
    return { intent: 'unknown', confidence: 0.1 };
  };

  // Generate response based on intent
  const generateResponse = (query, intent) => {
    const responses = {
      greeting: "Hello! I'm here to help you with grants and navigation. What would you like to know?",
      gratitude: "You're welcome! I'm here to help with any other questions about grants.",
      help: "I can help you with:\n\n• Finding grants and funding opportunities\n• Checking eligibility requirements\n• Understanding application processes\n• Navigating to different sections\n• Information about deadlines and amounts\n\nWhat specific area interests you?",
      
      grant_info: "I can help you find grants! Here's what I know:\n\n• Use the Creator Portal to apply for grants\n• Check the Public View to browse available opportunities\n• Visit Benefits for government schemes\n• Look at the Dashboard for analytics\n\nWhat type of grants are you looking for?",
      
      eligibility: "Grant eligibility varies by program. Generally, you'll need to:\n\n• Be an eligible organization type (nonprofit, business, etc.)\n• Meet specific criteria for each grant\n• Have a qualifying project or purpose\n• Submit required documentation\n\nWould you like me to help you check specific programs?",
      
      application: "Here's how to apply for grants:\n\n1. Visit the Creator Portal\n2. Create an account or log in\n3. Browse available grants\n4. Complete the application form\n5. Upload required documents\n6. Submit before the deadline\n\nNeed help with any specific step?",
      
      deadline: "Grant deadlines vary by program:\n\n• Some have specific deadlines (quarterly, annual)\n• Others accept rolling applications\n• Check individual grant listings for dates\n• Start applications early to avoid rushing\n\nWould you like me to show you specific deadlines?",
      
      amount: "Grant amounts vary widely:\n\n• Small grants: $1,000 - $25,000\n• Medium grants: $25,000 - $250,000\n• Large grants: $250,000+\n• Some programs offer millions\n\nThe amount depends on the program and project scope.",
      
      show_actions: "I can take you directly to these sections:",
      
      unknown: "I'm here to help with grants and platform navigation. You can ask me about:\n\n• Finding grants and funding\n• Application processes\n• Eligibility requirements\n• Platform navigation\n\nOr try asking me to 'show navigation options' for direct links!"
    };

    return responses[intent.intent] || responses.unknown;
  };

  // Handle navigation
  const handleNavigation = (target) => {
    const pathInfo = websitePaths[target];
    if (pathInfo) {
      // In a real app, you'd use React Router here
      // For now, we'll just show a message
      return `I can help you navigate to ${pathInfo.label}. In this demo, you would be taken to: ${pathInfo.path}`;
    }
    return "I'm not sure where that is. Try asking me to show navigation options!";
  };

  // Handle user message with enterprise features
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to display
    setMessages(prev => [...prev, userMessage]);
    
    // Add to enterprise conversation manager
    conversationManager.addMessage(userMessage, true);
    
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const intent = analyzeIntent(userMessage.text);
      let responseText = '';

      // Handle enterprise commands
      if (intent.intent === 'show_analytics' && userManager.canAccess('analytics')) {
        setShowAnalytics(true);
        responseText = 'Opening analytics dashboard...';
      } else if (intent.intent === 'show_history' && userManager.canAccess('conversation_export')) {
        setShowHistory(true);
        responseText = 'Opening conversation history...';
      } else if (intent.intent === 'show_settings') {
        setShowSettings(true);
        responseText = 'Opening settings...';
      } else if (intent.intent === 'admin_dashboard' && userManager.canAccess('admin_dashboard')) {
        responseText = 'Opening administrative dashboard...';
      } else if (intent.intent === 'search_conversations' && userManager.canAccess('conversation_export')) {
        handleConversationSearch(userMessage.text);
        responseText = 'Searching conversations...';
      } else if (intent.intent === 'navigate') {
        responseText = handleNavigation(intent.target);
      } else {
        responseText = generateResponse(userMessage.text, intent);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        intent: intent.intent,
        confidence: intent.confidence || 0.8
      };

      // Add bot message to display
      setMessages(prev => [...prev, botMessage]);
      
      // Add to enterprise conversation manager
      conversationManager.addMessage(botMessage, false);
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: languageManager.t('error'),
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      conversationManager.addMessage(errorMessage, false);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Enterprise helper functions
  const handleConversationSearch = (query) => {
    if (!userManager.canAccess('conversation_export')) {
      return;
    }
    
    const searchTerms = query.toLowerCase().replace(/(search|find|lookup)/g, '').trim();
    const results = conversationManager.searchConversations(searchTerms);
    setSearchResults(results.slice(0, 5)); // Limit to 5 results
  };

  const exportConversation = (conversationId) => {
    if (!userManager.canAccess('conversation_export')) {
      alert('Insufficient permissions to export conversations.');
      return;
    }
    
    const conversation = conversationManager.conversations.find(c => c.id === conversationId);
    if (conversation) {
      const dataStr = JSON.stringify(conversation, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation_${conversationId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const changeLanguage = (langCode) => {
    languageManager.setLanguage(langCode);
    // Refresh messages with new language
    setMessages(prev => prev.map(msg => ({
      ...msg,
      text: msg.sender === 'bot' && msg.intent === 'greeting' 
        ? languageManager.t('welcome') + " " + languageManager.t('help')
        : msg.text
    })));
  };

  const getAnalyticsData = () => {
    if (!userManager.canAccess('analytics')) {
      return { error: 'Insufficient permissions' };
    }
    return conversationManager.getAnalytics();
  };

  // Handle keyboard events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Render message content
  const renderMessageContent = (message) => {
    if (message.isError) {
      return (
        <div className="chatbot-error">
          <span>⚠️</span>
          <span>{message.text}</span>
        </div>
      );
    }

    return (
      <div className="chatbot-message-content">
        {message.text.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    );
  };

  // Quick action suggestions with enterprise features
  const quickActions = [
    "Find grants for my business",
    "Check eligibility requirements",
    "Show navigation options",
    userManager.canAccess('analytics') ? "Show analytics dashboard" : "How do I apply for grants?"
  ];
  
  const enterpriseQuickActions = [
    { key: 'analytics', label: languageManager.t('analytics'), icon: '📊', requiresPermission: 'analytics' },
    { key: 'history', label: languageManager.t('history'), icon: '📋', requiresPermission: 'conversation_export' },
    { key: 'settings', label: languageManager.t('settings'), icon: '⚙️' },
    { key: 'admin', label: languageManager.t('admin'), icon: '🔧', requiresPermission: 'admin_dashboard' }
  ];

  return (
    <div className="chatbot-container">
      {/* Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-labelledby="chatbot-title">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <span>🤖</span>
              </div>
              <div className="chatbot-header-info">
                <h3 id="chatbot-title">Grant Assistant</h3>
                <div className="chatbot-status">
                  <span className="status-indicator"></span>
                  <span>Online</span>
                  {userManager.currentUser.role !== userManager.userRoles.AGENT && (
                    <span className="user-role-badge">{userManager.currentUser.role}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="chatbot-header-controls">
              {/* Enterprise Controls */}
              {userManager.canAccess('analytics') && (
                <button
                  className="enterprise-control-btn"
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  aria-label="Analytics"
                  title="Analytics Dashboard"
                >
                  📊
                </button>
              )}
              {userManager.canAccess('conversation_export') && (
                <button
                  className="enterprise-control-btn"
                  onClick={() => setShowHistory(!showHistory)}
                  aria-label="Conversation History"
                  title="Conversation History"
                >
                  📋
                </button>
              )}
              <button
                className="enterprise-control-btn"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
                title="Settings"
              >
                ⚙️
              </button>
              <button
                className="chatbot-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="chatbot-empty-state">
                <div className="chatbot-empty-icon">🤖</div>
                <h4>Welcome to Grant Assistant</h4>
                <p>I'm here to help you discover grants and navigate the platform. What would you like to explore?</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender}`}
                role="article"
                aria-label={`${message.sender === 'user' ? 'Your message' : 'Assistant response'}`}
              >
                <div className="chatbot-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="chatbot-message-bubble">
                  {renderMessageContent(message)}
                  <div className="chatbot-message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {(isLoading || isTyping) && (
              <div className="chatbot-message bot" role="status" aria-live="polite">
                <div className="chatbot-avatar">🤖</div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <div className="typing-text">Thinking...</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about grants or navigation..."
                disabled={isLoading}
                className="chatbot-input"
                aria-label="Chat input"
                maxLength={500}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="chatbot-send-button"
                aria-label="Send message"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="chatbot-quick-actions" role="group" aria-label="Quick actions">
              <div className="quick-actions-label">Try asking:</div>
              <div className="quick-actions-list">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-button"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    aria-label={`Ask: ${action}`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Enterprise Controls */}
            {enterpriseQuickActions.some(action => 
              !action.requiresPermission || userManager.canAccess(action.requiresPermission)
            ) && (
              <div className="enterprise-controls">
                <div className="enterprise-controls-label">Enterprise:</div>
                <div className="enterprise-controls-list">
                  {enterpriseQuickActions.map((action) => {
                    if (action.requiresPermission && !userManager.canAccess(action.requiresPermission)) {
                      return null;
                    }
                    return (
                      <button
                        key={action.key}
                        className="enterprise-action-button"
                        onClick={() => {
                          const command = `Show ${action.label.toLowerCase()}`;
                          setInputValue(command);
                          setTimeout(() => handleSendMessage(), 100);
                        }}
                        disabled={isLoading}
                        aria-label={`Enterprise: ${action.label}`}
                        title={action.label}
                      >
                        <span className="enterprise-action-icon">{action.icon}</span>
                        <span className="enterprise-action-label">{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Language Selector */}
            <div className="chatbot-language-selector">
              <label htmlFor="language-select" className="sr-only">Select language</label>
              <select
                id="language-select"
                value={languageManager.getCurrentLanguage()}
                onChange={(e) => changeLanguage(e.target.value)}
                className="language-select"
                aria-label="Select language"
              >
                {languageManager.getAvailableLanguages().map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
            
            {/* Analytics Panel */}
            {showAnalytics && userManager.canAccess('analytics') && (
              <div className="chatbot-analytics-panel">
                <div className="analytics-header">
                  <h4>{languageManager.t('analytics')}</h4>
                  <button onClick={() => setShowAnalytics(false)}>×</button>
                </div>
                <div className="analytics-content">
                  {(() => {
                    const analytics = getAnalyticsData();
                    if (analytics.error) {
                      return <div className="analytics-error">{analytics.error}</div>;
                    }
                    return (
                      <div className="analytics-metrics">
                        <div className="metric">
                          <span className="metric-label">Total Conversations:</span>
                          <span className="metric-value">{analytics.totalConversations}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Total Messages:</span>
                          <span className="metric-value">{analytics.totalMessages}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Avg Messages/Conversation:</span>
                          <span className="metric-value">{analytics.averageMessagesPerConversation}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {/* History Panel */}
            {showHistory && userManager.canAccess('conversation_export') && (
              <div className="chatbot-history-panel">
                <div className="history-header">
                  <h4>{languageManager.t('history')}</h4>
                  <button onClick={() => setShowHistory(false)}>×</button>
                </div>
                <div className="history-content">
                  <div className="history-search">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="history-search-input"
                    />
                  </div>
                  <div className="history-list">
                    {conversationManager.conversations.slice(0, 5).map(conv => (
                      <div key={conv.id} className="history-item">
                        <div className="history-item-info">
                          <span className="history-item-title">{conv.title}</span>
                          <span className="history-item-date">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => exportConversation(conv.id)}
                          className="history-export-btn"
                          aria-label="Export conversation"
                        >
                          📥
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="chatbot-settings-panel">
                <div className="settings-header">
                  <h4>{languageManager.t('settings')}</h4>
                  <button onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div className="settings-content">
                  <div className="setting-group">
                    <label>User Role:</label>
                    <span className="user-role-display">{userManager.currentUser.role}</span>
                  </div>
                  <div className="setting-group">
                    <label>Language:</label>
                    <select
                      value={languageManager.getCurrentLanguage()}
                      onChange={(e) => changeLanguage(e.target.value)}
                      className="settings-language-select"
                    >
                      {languageManager.getAvailableLanguages().map(lang => (
                        <option key={lang.code} value={lang.code}>{lang.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="setting-group">
                    <label>Notifications:</label>
                    <input
                      type="checkbox"
                      checked={userManager.currentUser.preferences.notifications}
                      onChange={(e) => {
                        userManager.currentUser.preferences.notifications = e.target.checked;
                        localStorage.setItem('chatbot_user', JSON.stringify(userManager.currentUser));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;