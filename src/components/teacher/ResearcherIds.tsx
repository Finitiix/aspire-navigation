
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Save, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

type ResearcherIdsProps = {
  teacherId?: string;
  readOnly?: boolean;
}

type ResearcherData = {
  id?: string;
  teacher_id: string;
  google_scholar_id: string | null;
  scopus_author_id: string | null;
  orcid: string | null;
  web_of_science_id: string | null;
  pubmed_author_id: string | null;
  microsoft_academic_id: string | null;
  semantic_scholar_id: string | null;
  doi: string | null;
  scopus_eid: string | null;
  pubmed_id: string | null;
  arxiv_id: string | null;
  crossref_id: string | null;
  ssrn_id: string | null;
  no_google_scholar_id: boolean;
  no_scopus_author_id: boolean;
  no_orcid: boolean;
  no_web_of_science_id: boolean;
  no_pubmed_author_id: boolean;
  no_microsoft_academic_id: boolean;
  no_semantic_scholar_id: boolean;
  no_doi: boolean;
  no_scopus_eid: boolean;
  no_pubmed_id: boolean;
  no_arxiv_id: boolean;
  no_crossref_id: boolean;
  no_ssrn_id: boolean;
}

export function ResearcherIds({ teacherId, readOnly = false }: ResearcherIdsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState<ResearcherData>({
    teacher_id: '',
    google_scholar_id: '',
    scopus_author_id: '',
    orcid: '',
    web_of_science_id: '',
    pubmed_author_id: '',
    microsoft_academic_id: '',
    semantic_scholar_id: '',
    doi: '',
    scopus_eid: '',
    pubmed_id: '',
    arxiv_id: '',
    crossref_id: '',
    ssrn_id: '',
    no_google_scholar_id: false,
    no_scopus_author_id: false,
    no_orcid: false,
    no_web_of_science_id: false,
    no_pubmed_author_id: false,
    no_microsoft_academic_id: false,
    no_semantic_scholar_id: false,
    no_doi: false,
    no_scopus_eid: false,
    no_pubmed_id: false,
    no_arxiv_id: false,
    no_crossref_id: false,
    no_ssrn_id: false,
  });

  useEffect(() => {
    const fetchResearcherIds = async () => {
      try {
        // Get current user if teacherId is not provided
        let userId = teacherId;
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
        }
        
        if (!userId) return;

        setFormData(prev => ({ ...prev, teacher_id: userId as string }));

        const { data, error } = await supabase
          .from('researcher_ids')
          .select('*')
          .eq('teacher_id', userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData(data);
        }
      } catch (error) {
        console.error("Error fetching researcher IDs:", error);
      } finally {
        setInitialLoad(false);
      }
    };

    fetchResearcherIds();
  }, [teacherId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (checked: boolean, field: string) => {
    const noField = `no_${field}`;
    setFormData(prev => ({
      ...prev,
      [noField]: checked
    }));
  };

  const saveResearcherIds = async () => {
    try {
      setLoading(true);
      
      // Check if data already exists
      const { data } = await supabase
        .from('researcher_ids')
        .select('id')
        .eq('teacher_id', formData.teacher_id)
        .maybeSingle();
      
      let result;
      
      if (data) {
        // Update existing record
        result = await supabase
          .from('researcher_ids')
          .update(formData)
          .eq('id', data.id);
      } else {
        // Insert new record
        result = await supabase
          .from('researcher_ids')
          .insert(formData);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: "Researcher IDs saved successfully",
        variant: "default"
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving researcher IDs:", error);
      toast({
        title: "Error",
        description: "Failed to save researcher IDs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoad) {
    return <div className="h-20 flex items-center justify-center">Loading researcher IDs...</div>;
  }

  return (
    <Card className="mt-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Author & Researcher IDs</CardTitle>
        {!readOnly && !isEditing && (
          <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit IDs
          </Button>
        )}
        {!readOnly && isEditing && (
          <div className="flex gap-2">
            <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={saveResearcherIds} disabled={loading} size="sm">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Author & Researcher IDs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResearcherIdField
                label="Google Scholar Profile ID"
                name="google_scholar_id"
                value={formData.google_scholar_id}
                noValue={formData.no_google_scholar_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "google_scholar_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="Scopus Author ID"
                name="scopus_author_id"
                value={formData.scopus_author_id}
                noValue={formData.no_scopus_author_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "scopus_author_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="ORCID"
                name="orcid"
                value={formData.orcid}
                noValue={formData.no_orcid}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "orcid")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="Web of Science Researcher ID"
                name="web_of_science_id"
                value={formData.web_of_science_id}
                noValue={formData.no_web_of_science_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "web_of_science_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="PubMed Author ID"
                name="pubmed_author_id"
                value={formData.pubmed_author_id}
                noValue={formData.no_pubmed_author_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "pubmed_author_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="Microsoft Academic ID"
                name="microsoft_academic_id"
                value={formData.microsoft_academic_id}
                noValue={formData.no_microsoft_academic_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "microsoft_academic_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="Semantic Scholar ID"
                name="semantic_scholar_id"
                value={formData.semantic_scholar_id}
                noValue={formData.no_semantic_scholar_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "semantic_scholar_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Publication IDs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ResearcherIdField
                label="DOI (Digital Object Identifier)"
                name="doi"
                value={formData.doi}
                noValue={formData.no_doi}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "doi")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="Scopus EID"
                name="scopus_eid"
                value={formData.scopus_eid}
                noValue={formData.no_scopus_eid}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "scopus_eid")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="PubMed ID (PMID)"
                name="pubmed_id"
                value={formData.pubmed_id}
                noValue={formData.no_pubmed_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "pubmed_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="ArXiv ID"
                name="arxiv_id"
                value={formData.arxiv_id}
                noValue={formData.no_arxiv_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "arxiv_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="CrossRef ID"
                name="crossref_id"
                value={formData.crossref_id}
                noValue={formData.no_crossref_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "crossref_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
              <ResearcherIdField
                label="SSRN ID"
                name="ssrn_id"
                value={formData.ssrn_id}
                noValue={formData.no_ssrn_id}
                onChange={handleInputChange}
                onCheckChange={(checked) => handleCheckboxChange(checked, "ssrn_id")}
                isEditing={isEditing}
                readOnly={readOnly}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

type ResearcherIdFieldProps = {
  label: string;
  name: string;
  value: string | null;
  noValue: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCheckChange: (checked: boolean) => void;
  isEditing: boolean;
  readOnly: boolean;
}

function ResearcherIdField({ 
  label, 
  name, 
  value, 
  noValue, 
  onChange, 
  onCheckChange, 
  isEditing,
  readOnly
}: ResearcherIdFieldProps) {
  if (readOnly || !isEditing) {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="text-sm">
          {noValue 
            ? <span className="text-gray-500 italic">Not applicable</span> 
            : value 
              ? <span>{value}</span> 
              : <span className="text-gray-500 italic">Not provided</span>
          }
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium">{label} {!noValue && "*"}</Label>
      <div className="space-y-2">
        <Input
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          disabled={noValue}
          required={!noValue}
          placeholder={`Enter your ${label}`}
        />
        <div className="flex items-center space-x-2">
          <Checkbox 
            id={`no_${name}`}
            checked={noValue}
            onCheckedChange={onCheckChange}
          />
          <label 
            htmlFor={`no_${name}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            I don't have a {label}
          </label>
        </div>
      </div>
    </div>
  );
}
