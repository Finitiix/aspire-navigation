
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ResearcherIdsProps = {
  teacherId?: string;
  isEditable?: boolean;
};

type ResearcherIdData = {
  id: string;
  teacher_id: string;
  google_scholar_id: string | null;
  scopus_author_id: string | null;
  orcid_id: string | null;
  wos_researcher_id: string | null;
  pubmed_author_id: string | null;
  microsoft_academic_id: string | null;
  semantic_scholar_id: string | null;
  doi: string | null;
  scopus_eid: string | null;
  pubmed_id: string | null;
  arxiv_id: string | null;
  crossref_id: string | null;
  ssrn_id: string | null;
  no_google_scholar: boolean;
  no_scopus_author: boolean;
  no_orcid: boolean;
  no_wos_researcher: boolean;
  no_pubmed_author: boolean;
  no_microsoft_academic: boolean;
  no_semantic_scholar: boolean;
  no_doi: boolean;
  no_scopus_eid: boolean;
  no_pubmed_id: boolean;
  no_arxiv: boolean;
  no_crossref: boolean;
  no_ssrn: boolean;
};

export const ResearcherIds = ({ teacherId, isEditable = true }: ResearcherIdsProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ResearcherIdData>({
    id: '',
    teacher_id: '',
    google_scholar_id: '',
    scopus_author_id: '',
    orcid_id: '',
    wos_researcher_id: '',
    pubmed_author_id: '',
    microsoft_academic_id: '',
    semantic_scholar_id: '',
    doi: '',
    scopus_eid: '',
    pubmed_id: '',
    arxiv_id: '',
    crossref_id: '',
    ssrn_id: '',
    no_google_scholar: false,
    no_scopus_author: false,
    no_orcid: false,
    no_wos_researcher: false,
    no_pubmed_author: false,
    no_microsoft_academic: false,
    no_semantic_scholar: false,
    no_doi: false,
    no_scopus_eid: false,
    no_pubmed_id: false,
    no_arxiv: false,
    no_crossref: false,
    no_ssrn: false,
  });

  useEffect(() => {
    const fetchResearcherIds = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        const userId = teacherId || user?.id;
        
        if (!userId) return;

        // Check if researcher IDs exist for this teacher
        const { data, error } = await supabase
          .from('researcher_ids')
          .select('*')
          .eq('teacher_id', userId)
          .maybeSingle();

        if (error) {
          console.error("Error fetching researcher IDs:", error);
          throw error;
        }

        if (data) {
          setFormData({
            ...data,
            google_scholar_id: data.google_scholar_id || '',
            scopus_author_id: data.scopus_author_id || '',
            orcid_id: data.orcid_id || '',
            wos_researcher_id: data.wos_researcher_id || '',
            pubmed_author_id: data.pubmed_author_id || '',
            microsoft_academic_id: data.microsoft_academic_id || '',
            semantic_scholar_id: data.semantic_scholar_id || '',
            doi: data.doi || '',
            scopus_eid: data.scopus_eid || '',
            pubmed_id: data.pubmed_id || '',
            arxiv_id: data.arxiv_id || '',
            crossref_id: data.crossref_id || '',
            ssrn_id: data.ssrn_id || '',
          });
        } else {
          // Set teacher_id for new record
          setFormData(prev => ({
            ...prev,
            teacher_id: userId
          }));
        }
      } catch (error) {
        console.error('Error fetching researcher IDs:', error);
        toast.error('Failed to load researcher IDs');
      } finally {
        setLoading(false);
      }
    };

    fetchResearcherIds();
  }, [teacherId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.teacher_id) {
      toast.error('Teacher ID is missing');
      return;
    }
    
    try {
      setSaving(true);
      
      // Check if we need to create or update
      const isNewRecord = !formData.id;
      
      if (isNewRecord) {
        // Create new record
        const { data, error } = await supabase
          .from('researcher_ids')
          .insert([{
            teacher_id: formData.teacher_id,
            google_scholar_id: formData.no_google_scholar ? null : formData.google_scholar_id || null,
            scopus_author_id: formData.no_scopus_author ? null : formData.scopus_author_id || null,
            orcid_id: formData.no_orcid ? null : formData.orcid_id || null,
            wos_researcher_id: formData.no_wos_researcher ? null : formData.wos_researcher_id || null,
            pubmed_author_id: formData.no_pubmed_author ? null : formData.pubmed_author_id || null,
            microsoft_academic_id: formData.no_microsoft_academic ? null : formData.microsoft_academic_id || null,
            semantic_scholar_id: formData.no_semantic_scholar ? null : formData.semantic_scholar_id || null,
            doi: formData.no_doi ? null : formData.doi || null,
            scopus_eid: formData.no_scopus_eid ? null : formData.scopus_eid || null,
            pubmed_id: formData.no_pubmed_id ? null : formData.pubmed_id || null,
            arxiv_id: formData.no_arxiv ? null : formData.arxiv_id || null,
            crossref_id: formData.no_crossref ? null : formData.crossref_id || null,
            ssrn_id: formData.no_ssrn ? null : formData.ssrn_id || null,
            no_google_scholar: formData.no_google_scholar,
            no_scopus_author: formData.no_scopus_author,
            no_orcid: formData.no_orcid,
            no_wos_researcher: formData.no_wos_researcher,
            no_pubmed_author: formData.no_pubmed_author,
            no_microsoft_academic: formData.no_microsoft_academic,
            no_semantic_scholar: formData.no_semantic_scholar,
            no_doi: formData.no_doi,
            no_scopus_eid: formData.no_scopus_eid,
            no_pubmed_id: formData.no_pubmed_id,
            no_arxiv: formData.no_arxiv,
            no_crossref: formData.no_crossref,
            no_ssrn: formData.no_ssrn,
          }])
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          setFormData({
            ...formData,
            id: data[0].id
          });
          toast.success('Researcher IDs saved successfully');
        }
      } else {
        // Update existing record
        const { error } = await supabase
          .from('researcher_ids')
          .update({
            google_scholar_id: formData.no_google_scholar ? null : formData.google_scholar_id || null,
            scopus_author_id: formData.no_scopus_author ? null : formData.scopus_author_id || null,
            orcid_id: formData.no_orcid ? null : formData.orcid_id || null,
            wos_researcher_id: formData.no_wos_researcher ? null : formData.wos_researcher_id || null,
            pubmed_author_id: formData.no_pubmed_author ? null : formData.pubmed_author_id || null,
            microsoft_academic_id: formData.no_microsoft_academic ? null : formData.microsoft_academic_id || null,
            semantic_scholar_id: formData.no_semantic_scholar ? null : formData.semantic_scholar_id || null,
            doi: formData.no_doi ? null : formData.doi || null,
            scopus_eid: formData.no_scopus_eid ? null : formData.scopus_eid || null,
            pubmed_id: formData.no_pubmed_id ? null : formData.pubmed_id || null,
            arxiv_id: formData.no_arxiv ? null : formData.arxiv_id || null,
            crossref_id: formData.no_crossref ? null : formData.crossref_id || null,
            ssrn_id: formData.no_ssrn ? null : formData.ssrn_id || null,
            no_google_scholar: formData.no_google_scholar,
            no_scopus_author: formData.no_scopus_author,
            no_orcid: formData.no_orcid,
            no_wos_researcher: formData.no_wos_researcher,
            no_pubmed_author: formData.no_pubmed_author,
            no_microsoft_academic: formData.no_microsoft_academic,
            no_semantic_scholar: formData.no_semantic_scholar,
            no_doi: formData.no_doi,
            no_scopus_eid: formData.no_scopus_eid,
            no_pubmed_id: formData.no_pubmed_id,
            no_arxiv: formData.no_arxiv,
            no_crossref: formData.no_crossref,
            no_ssrn: formData.no_ssrn,
          })
          .eq('id', formData.id);
          
        if (error) throw error;
        toast.success('Researcher IDs updated successfully');
      }
    } catch (error) {
      console.error('Error saving researcher IDs:', error);
      toast.error('Failed to save researcher IDs');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Researcher & Publication IDs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-4">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const renderIdField = (label: string, name: string, noIdName: string) => {
    const isDisabled = formData[noIdName as keyof typeof formData] as boolean || !isEditable;
    
    return (
      <div className="mb-3">
        <div className="flex justify-between items-start mb-1">
          <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
          {isEditable && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={noIdName} 
                checked={formData[noIdName as keyof typeof formData] as boolean}
                onCheckedChange={(checked) => handleCheckboxChange(noIdName, checked === true)}
              />
              <Label htmlFor={noIdName} className="text-xs">I don't have this ID</Label>
            </div>
          )}
        </div>
        <Input
          id={name}
          name={name}
          value={formData[name as keyof typeof formData] as string || ''}
          onChange={handleChange}
          disabled={isDisabled}
          placeholder={isDisabled ? "Not applicable" : `Enter your ${label}`}
        />
      </div>
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Researcher & Publication IDs</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Author & Researcher IDs</h3>
              {renderIdField("Google Scholar Profile ID", "google_scholar_id", "no_google_scholar")}
              {renderIdField("Scopus Author ID", "scopus_author_id", "no_scopus_author")}
              {renderIdField("ORCID", "orcid_id", "no_orcid")}
              {renderIdField("Web of Science Researcher ID", "wos_researcher_id", "no_wos_researcher")}
              {renderIdField("PubMed Author ID", "pubmed_author_id", "no_pubmed_author")}
              {renderIdField("Microsoft Academic ID", "microsoft_academic_id", "no_microsoft_academic")}
              {renderIdField("Semantic Scholar ID", "semantic_scholar_id", "no_semantic_scholar")}
            </div>
            <div>
              <h3 className="font-semibold mb-3">Publication IDs</h3>
              {renderIdField("DOI (Digital Object Identifier)", "doi", "no_doi")}
              {renderIdField("Scopus EID", "scopus_eid", "no_scopus_eid")}
              {renderIdField("PubMed ID (PMID)", "pubmed_id", "no_pubmed_id")}
              {renderIdField("ArXiv ID", "arxiv_id", "no_arxiv")}
              {renderIdField("CrossRef ID", "crossref_id", "no_crossref")}
              {renderIdField("SSRN ID", "ssrn_id", "no_ssrn")}
            </div>
          </div>
          
          {isEditable && (
            <div className="mt-4 flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save IDs'}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
