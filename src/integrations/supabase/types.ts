export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      checklists: {
        Row: {
          cliente_id: string
          conta_sem_bloqueios: boolean
          conversoes_configuradas: boolean
          created_at: string
          criativos_atualizados: boolean
          cta_claro: boolean
          data: string
          id: string
          integracao_crm: boolean
          pagamento_ok: boolean
          pendencias: string | null
          pixel_tag_instalados: boolean
          relatorio_semanal_data: string | null
          relatorio_semanal_enviado: boolean | null
          saldo_suficiente: boolean
          teste_ab_ativo: boolean
          updated_at: string
        }
        Insert: {
          cliente_id: string
          conta_sem_bloqueios?: boolean
          conversoes_configuradas?: boolean
          created_at?: string
          criativos_atualizados?: boolean
          cta_claro?: boolean
          data?: string
          id?: string
          integracao_crm?: boolean
          pagamento_ok?: boolean
          pendencias?: string | null
          pixel_tag_instalados?: boolean
          relatorio_semanal_data?: string | null
          relatorio_semanal_enviado?: boolean | null
          saldo_suficiente?: boolean
          teste_ab_ativo?: boolean
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          conta_sem_bloqueios?: boolean
          conversoes_configuradas?: boolean
          created_at?: string
          criativos_atualizados?: boolean
          cta_claro?: boolean
          data?: string
          id?: string
          integracao_crm?: boolean
          pagamento_ok?: boolean
          pendencias?: string | null
          pixel_tag_instalados?: boolean
          relatorio_semanal_data?: string | null
          relatorio_semanal_enviado?: boolean | null
          saldo_suficiente?: boolean
          teste_ab_ativo?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      client_reports: {
        Row: {
          cliente_id: string
          created_at: string
          criativos: Json | null
          data_values: Json
          google_cliques: number | null
          google_contatos: number | null
          google_cpm: number | null
          google_custo_por_lead: number | null
          google_impressoes: number | null
          google_investido: number | null
          id: string
          layout: Json
          meta_conversas: number | null
          meta_cpm: number | null
          meta_custo_por_lead: number | null
          meta_custo_por_seguidor: number | null
          meta_engajamento: number | null
          meta_impressoes: number | null
          meta_investido: number | null
          nome: string
          objetivos: string[] | null
          periodo_fim: string
          periodo_inicio: string
          resumo: string | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          cliente_id: string
          created_at?: string
          criativos?: Json | null
          data_values?: Json
          google_cliques?: number | null
          google_contatos?: number | null
          google_cpm?: number | null
          google_custo_por_lead?: number | null
          google_impressoes?: number | null
          google_investido?: number | null
          id?: string
          layout?: Json
          meta_conversas?: number | null
          meta_cpm?: number | null
          meta_custo_por_lead?: number | null
          meta_custo_por_seguidor?: number | null
          meta_engajamento?: number | null
          meta_impressoes?: number | null
          meta_investido?: number | null
          nome: string
          objetivos?: string[] | null
          periodo_fim: string
          periodo_inicio: string
          resumo?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          cliente_id?: string
          created_at?: string
          criativos?: Json | null
          data_values?: Json
          google_cliques?: number | null
          google_contatos?: number | null
          google_cpm?: number | null
          google_custo_por_lead?: number | null
          google_impressoes?: number | null
          google_investido?: number | null
          id?: string
          layout?: Json
          meta_conversas?: number | null
          meta_cpm?: number | null
          meta_custo_por_lead?: number | null
          meta_custo_por_seguidor?: number | null
          meta_engajamento?: number | null
          meta_impressoes?: number | null
          meta_investido?: number | null
          nome?: string
          objetivos?: string[] | null
          periodo_fim?: string
          periodo_inicio?: string
          resumo?: string | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_reports_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_reports_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      client_time_tracking: {
        Row: {
          cliente_id: string
          closed_at: string | null
          duration_seconds: number | null
          gestor_id: string
          id: string
          opened_at: string
          session_id: string | null
        }
        Insert: {
          cliente_id: string
          closed_at?: string | null
          duration_seconds?: number | null
          gestor_id: string
          id?: string
          opened_at?: string
          session_id?: string | null
        }
        Update: {
          cliente_id?: string
          closed_at?: string | null
          duration_seconds?: number | null
          gestor_id?: string
          id?: string
          opened_at?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_time_tracking_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_time_tracking_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_time_tracking_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "gestor_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      client_tracking: {
        Row: {
          clarity_installed: boolean | null
          cliente_id: string
          created_at: string
          ga4_id: string | null
          ga4_ids: string[] | null
          gmn_status: string | null
          google_ads_status: string | null
          google_dias_restantes: number | null
          google_proxima_recarga: string | null
          google_recarga_tipo: string | null
          google_saldo: number | null
          google_ultima_validacao: string | null
          google_valor_diario: number | null
          gtm_id: string | null
          gtm_ids: string[] | null
          id: string
          meta_ads_active: boolean | null
          meta_dias_restantes: number | null
          meta_proxima_recarga: string | null
          meta_recarga_tipo: string | null
          meta_saldo: number | null
          meta_ultima_validacao: string | null
          meta_valor_diario: number | null
          pixel_installed: boolean | null
          search_console_status: string | null
          updated_at: string
          url: string | null
        }
        Insert: {
          clarity_installed?: boolean | null
          cliente_id: string
          created_at?: string
          ga4_id?: string | null
          ga4_ids?: string[] | null
          gmn_status?: string | null
          google_ads_status?: string | null
          google_dias_restantes?: number | null
          google_proxima_recarga?: string | null
          google_recarga_tipo?: string | null
          google_saldo?: number | null
          google_ultima_validacao?: string | null
          google_valor_diario?: number | null
          gtm_id?: string | null
          gtm_ids?: string[] | null
          id?: string
          meta_ads_active?: boolean | null
          meta_dias_restantes?: number | null
          meta_proxima_recarga?: string | null
          meta_recarga_tipo?: string | null
          meta_saldo?: number | null
          meta_ultima_validacao?: string | null
          meta_valor_diario?: number | null
          pixel_installed?: boolean | null
          search_console_status?: string | null
          updated_at?: string
          url?: string | null
        }
        Update: {
          clarity_installed?: boolean | null
          cliente_id?: string
          created_at?: string
          ga4_id?: string | null
          ga4_ids?: string[] | null
          gmn_status?: string | null
          google_ads_status?: string | null
          google_dias_restantes?: number | null
          google_proxima_recarga?: string | null
          google_recarga_tipo?: string | null
          google_saldo?: number | null
          google_ultima_validacao?: string | null
          google_valor_diario?: number | null
          gtm_id?: string | null
          gtm_ids?: string[] | null
          id?: string
          meta_ads_active?: boolean | null
          meta_dias_restantes?: number | null
          meta_proxima_recarga?: string | null
          meta_recarga_tipo?: string | null
          meta_saldo?: number | null
          meta_ultima_validacao?: string | null
          meta_valor_diario?: number | null
          pixel_installed?: boolean | null
          search_console_status?: string | null
          updated_at?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_tracking_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string
          data_inicio: string
          expectativa_resultados: string | null
          gestor_id: string
          id: string
          investimento_mensal: number | null
          logo_url: string | null
          nome: string
          observacoes: string | null
          redes_sociais: string[] | null
          telefone_contato: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_inicio?: string
          expectativa_resultados?: string | null
          gestor_id: string
          id?: string
          investimento_mensal?: number | null
          logo_url?: string | null
          nome: string
          observacoes?: string | null
          redes_sociais?: string[] | null
          telefone_contato?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_inicio?: string
          expectativa_resultados?: string | null
          gestor_id?: string
          id?: string
          investimento_mensal?: number | null
          logo_url?: string | null
          nome?: string
          observacoes?: string | null
          redes_sociais?: string[] | null
          telefone_contato?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clientes_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
        ]
      }
      gestor_sessions: {
        Row: {
          duration_seconds: number | null
          gestor_id: string
          id: string
          login_at: string
          logout_at: string | null
        }
        Insert: {
          duration_seconds?: number | null
          gestor_id: string
          id?: string
          login_at?: string
          logout_at?: string | null
        }
        Update: {
          duration_seconds?: number | null
          gestor_id?: string
          id?: string
          login_at?: string
          logout_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gestor_sessions_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
        ]
      }
      gestores: {
        Row: {
          created_at: string
          dados_completos: boolean
          first_login_at: string | null
          foto_preenchida: boolean
          foto_url: string | null
          id: string
          links: Json | null
          nome: string
          onboarding_completo: boolean
          senha: string
          telefone: string | null
          welcome_modal_dismissed: boolean | null
        }
        Insert: {
          created_at?: string
          dados_completos?: boolean
          first_login_at?: string | null
          foto_preenchida?: boolean
          foto_url?: string | null
          id?: string
          links?: Json | null
          nome: string
          onboarding_completo?: boolean
          senha?: string
          telefone?: string | null
          welcome_modal_dismissed?: boolean | null
        }
        Update: {
          created_at?: string
          dados_completos?: boolean
          first_login_at?: string | null
          foto_preenchida?: boolean
          foto_url?: string | null
          id?: string
          links?: Json | null
          nome?: string
          onboarding_completo?: boolean
          senha?: string
          telefone?: string | null
          welcome_modal_dismissed?: boolean | null
        }
        Relationships: []
      }
      relatorios: {
        Row: {
          alcance_facebook: number | null
          cliente_id: string
          cliques_facebook: number | null
          cliques_google: number | null
          conversoes_facebook: number | null
          conversoes_google: number | null
          created_at: string
          data: string
          edit_count: number | null
          edited_at: string | null
          id: string
          impressoes_facebook: number | null
          impressoes_google: number | null
          investimento_facebook: number | null
          investimento_google: number | null
          taxa_superacao: number | null
          top_palavras_chaves: string[] | null
          topo_pesquisas: number | null
          updated_at: string
        }
        Insert: {
          alcance_facebook?: number | null
          cliente_id: string
          cliques_facebook?: number | null
          cliques_google?: number | null
          conversoes_facebook?: number | null
          conversoes_google?: number | null
          created_at?: string
          data?: string
          edit_count?: number | null
          edited_at?: string | null
          id?: string
          impressoes_facebook?: number | null
          impressoes_google?: number | null
          investimento_facebook?: number | null
          investimento_google?: number | null
          taxa_superacao?: number | null
          top_palavras_chaves?: string[] | null
          topo_pesquisas?: number | null
          updated_at?: string
        }
        Update: {
          alcance_facebook?: number | null
          cliente_id?: string
          cliques_facebook?: number | null
          cliques_google?: number | null
          conversoes_facebook?: number | null
          conversoes_google?: number | null
          created_at?: string
          data?: string
          edit_count?: number | null
          edited_at?: string | null
          id?: string
          impressoes_facebook?: number | null
          impressoes_google?: number | null
          investimento_facebook?: number | null
          investimento_google?: number | null
          taxa_superacao?: number | null
          top_palavras_chaves?: string[] | null
          topo_pesquisas?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      report_template_metrics: {
        Row: {
          created_at: string
          display_order: number | null
          icon: string | null
          id: string
          is_visible: boolean | null
          label: string
          metric_key: string
          platform: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label: string
          metric_key: string
          platform: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          display_order?: number | null
          icon?: string | null
          id?: string
          is_visible?: boolean | null
          label?: string
          metric_key?: string
          platform?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "report_template_metrics_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "report_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      report_templates: {
        Row: {
          created_at: string
          descricao: string | null
          gestor_id: string | null
          id: string
          is_global: boolean
          layout: Json
          nome: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          gestor_id?: string | null
          id?: string
          is_global?: boolean
          layout?: Json
          nome: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          gestor_id?: string | null
          id?: string
          is_global?: boolean
          layout?: Json
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_gestor_id_fkey"
            columns: ["gestor_id"]
            isOneToOne: false
            referencedRelation: "gestores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
