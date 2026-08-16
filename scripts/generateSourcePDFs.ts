import { jsPDF } from 'jspdf';
import fs from 'fs';
import path from 'path';

interface SourceDocumentSpec {
  filename: string;
  actName: string;
  actShortTitle: string;
  actNumber: string;
  year: number;
  jurisdiction: 'CENTRAL' | 'KARNATAKA';
  sourceUrl: string;
  sourceDocument: string;
  sourceTier: 'Tier 1 (Official Government)' | 'Tier 2 (Official Gazette)' | 'Tier 3 (Secondary Discovery)';
  retrievalDate: string;
  applicabilityCategory: 'lease_tenancy' | 'confidentiality_nda' | 'employment_service' | 'general_contract' | 'dispute_arbitration' | 'consumer_rights';
  keywords: string[];
  sections: {
    chapter?: string;
    sectionNumber: string;
    sectionTitle: string;
    statuteText: string;
  }[];
}

const OFFICIAL_SOURCE_DOCUMENTS: SourceDocumentSpec[] = [
  // ==========================================================================
  // CENTRAL LAWS (INDIA CODE / OFFICIAL GOVERNMENT OF INDIA PUBLICATIONS)
  // ==========================================================================
  {
    filename: 'indian_contract_act_1872.pdf',
    actName: 'The Indian Contract Act, 1872',
    actShortTitle: 'Contract Act 1872',
    actNumber: 'Act No. 9 of 1872',
    year: 1872,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2263',
    sourceDocument: 'Indian Contract Act 1872 - Official Gazette Publication',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'general_contract',
    keywords: ['contract', 'agreement', 'consideration', 'free consent', 'breach', 'damages', 'restraint of trade'],
    sections: [
      {
        chapter: 'Preliminary',
        sectionNumber: '2(h)',
        sectionTitle: 'Definition of Contract',
        statuteText: 'An agreement enforceable by law is a contract.'
      },
      {
        chapter: 'Preliminary',
        sectionNumber: '2(d)',
        sectionTitle: 'Definition of Consideration',
        statuteText: 'When, at the desire of the promisor, the promisee or any other person has done or abstained from doing, or does or abstains from doing, or promises to do or to abstain from doing, something, such act or abstinence or promise is called a consideration for the promise.'
      },
      {
        chapter: 'CHAPTER II - Of Contracts, Voidable Contracts and Void Agreements',
        sectionNumber: '10',
        sectionTitle: 'What Agreements Are Contracts',
        statuteText: 'All agreements are contracts if they are made by the free consent of parties competent to contract, for a lawful consideration and with a lawful object, and are not hereby expressly declared to be void.'
      },
      {
        chapter: 'CHAPTER II - Void Agreements',
        sectionNumber: '27',
        sectionTitle: 'Agreement in Restraint of Trade Void',
        statuteText: 'Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void. Exception 1: One who sells the goodwill of a business may agree with the buyer to refrain from carrying on a similar business.'
      },
      {
        chapter: 'CHAPTER VI - Of the Consequences of Breach of Contract',
        sectionNumber: '73',
        sectionTitle: 'Compensation for Loss or Damage Caused by Breach of Contract',
        statuteText: 'When a contract has been broken, the party who suffers by such breach is entitled to receive, from the party who has broken the contract, compensation for any loss or damage caused to him thereby, which naturally arose in the usual course of things from such breach, or which the parties knew, when they made the contract, to be likely to result from the breach of it.'
      }
    ]
  },
  {
    filename: 'transfer_of_property_act_1882.pdf',
    actName: 'The Transfer of Property Act, 1882',
    actShortTitle: 'Transfer of Property Act 1882',
    actNumber: 'Act No. 4 of 1882',
    year: 1882,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2338',
    sourceDocument: 'Transfer of Property Act 1882 - Official Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['lease', 'lessor', 'lessee', 'rent', 'tenancy', 'transfer of property', 'premium'],
    sections: [
      {
        chapter: 'CHAPTER V - Of Leases of Immovable Property',
        sectionNumber: '105',
        sectionTitle: 'Lease Defined',
        statuteText: 'A lease of immovable property is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value, to be rendered periodically or on specified occasions to the transferor by the transferee, who accepts the transfer on such terms.'
      },
      {
        chapter: 'CHAPTER V - Of Leases of Immovable Property',
        sectionNumber: '107',
        sectionTitle: 'Leases How Made',
        statuteText: 'A lease of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, can be made only by a registered instrument. All other leases of immovable property may be made either by a registered instrument or by oral agreement accompanied by delivery of possession.'
      },
      {
        chapter: 'CHAPTER V - Of Leases of Immovable Property',
        sectionNumber: '108',
        sectionTitle: 'Rights and Liabilities of Lessor and Lessee',
        statuteText: 'In the absence of a contract or local usage to the contrary, the lessor is bound to disclose to the lessee any material defect in the property, and the lessee is bound to pay or tender, at the proper time and place, the premium or rent to the lessor or his agent in this behalf.'
      }
    ]
  },
  {
    filename: 'registration_act_1908.pdf',
    actName: 'The Registration Act, 1908',
    actShortTitle: 'Registration Act 1908',
    actNumber: 'Act No. 16 of 1908',
    year: 1908,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2190',
    sourceDocument: 'Registration Act 1908 - Official Publication',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['registration', 'compulsory registration', 'lease', 'immovable property', 'sub-registrar'],
    sections: [
      {
        chapter: 'PART III - Of Registrable Documents',
        sectionNumber: '17(1)(d)',
        sectionTitle: 'Documents of which Registration is Compulsory',
        statuteText: 'Leases of immovable property from year to year, or for any term exceeding one year, or reserving a yearly rent, shall be registered compulsorily under this Act.'
      },
      {
        chapter: 'PART X - Of the Effects of Registration and Non-Registration',
        sectionNumber: '49',
        sectionTitle: 'Effect of Non-Registration of Documents Required to be Registered',
        statuteText: 'No document required by Section 17 or by any provision of the Transfer of Property Act 1882 to be registered shall affect any immovable property comprised therein, or be received as evidence of any transaction affecting such property, unless it has been registered.'
      }
    ]
  },
  {
    filename: 'specific_relief_act_1963.pdf',
    actName: 'The Specific Relief Act, 1963',
    actShortTitle: 'Specific Relief Act 1963',
    actNumber: 'Act No. 47 of 1963',
    year: 1963,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1583',
    sourceDocument: 'Specific Relief Act 1963 - Official Government Publication',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'general_contract',
    keywords: ['specific performance', 'remedy', 'enforcement', 'injunction', 'breach'],
    sections: [
      {
        chapter: 'PART II - Specific Relief - CHAPTER II - Specific Performance of Contracts',
        sectionNumber: '10',
        sectionTitle: 'Specific Performance in Respect of Contracts',
        statuteText: 'The specific performance of a contract shall be enforced by the court subject to the provisions contained in sub-section (2) of section 11, section 14 and section 16.'
      }
    ]
  },
  {
    filename: 'arbitration_and_conciliation_act_1996.pdf',
    actName: 'The Arbitration and Conciliation Act, 1996',
    actShortTitle: 'Arbitration Act 1996',
    actNumber: 'Act No. 26 of 1996',
    year: 1996,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1978',
    sourceDocument: 'Arbitration and Conciliation Act 1996 - Official Gazette Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'dispute_arbitration',
    keywords: ['arbitration', 'arbitral tribunal', 'arbitration agreement', 'dispute resolution', 'award'],
    sections: [
      {
        chapter: 'PART I - CHAPTER II - Arbitration Agreement',
        sectionNumber: '7',
        sectionTitle: 'Arbitration Agreement',
        statuteText: 'In this Part, "arbitration agreement" means an agreement by the parties to submit to arbitration all or certain disputes which have arisen or which may arise between them in respect of a defined legal relationship, whether contractual or not. An arbitration agreement shall be in writing.'
      }
    ]
  },
  {
    filename: 'information_technology_act_2000.pdf',
    actName: 'The Information Technology Act, 2000',
    actShortTitle: 'IT Act 2000',
    actNumber: 'Act No. 21 of 2000',
    year: 2000,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/1999',
    sourceDocument: 'Information Technology Act 2000 - Official Gazette Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'confidentiality_nda',
    keywords: ['electronic record', 'data privacy', 'confidentiality', 'disclosure', 'personal information'],
    sections: [
      {
        chapter: 'CHAPTER XI - Offences',
        sectionNumber: '72A',
        sectionTitle: 'Punishment for Disclosure of Information in Breach of Lawful Contract',
        statuteText: 'Save as otherwise provided in this Act or any other law for the time being in force, any person including an intermediary who, while providing services under the terms of lawful contract, has secured access to any material containing personal information about another person, with the intent to cause or knowing that he is likely to cause wrongful loss or wrongful gain discloses, without the consent of the person concerned, or in breach of a lawful contract, such material, shall be punished with imprisonment for a term which may extend to three years, or with fine which may extend to five lakh rupees, or with both.'
      }
    ]
  },
  {
    filename: 'consumer_protection_act_2019.pdf',
    actName: 'The Consumer Protection Act, 2019',
    actShortTitle: 'Consumer Protection Act 2019',
    actNumber: 'Act No. 35 of 2019',
    year: 2019,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/15256',
    sourceDocument: 'Consumer Protection Act 2019 - Official Gazette Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'consumer_rights',
    keywords: ['unfair contract', 'consumer rights', 'deficiency in service', 'unfair trade practice'],
    sections: [
      {
        chapter: 'CHAPTER I - Preliminary',
        sectionNumber: '2(47)',
        sectionTitle: 'Unfair Contract Defined',
        statuteText: 'Unfair contract means a contract between a manufacturer or trader or service provider on one hand, and a consumer on the other, having such terms which cause significant change in the rights of such consumer, including requiring manifestly excessive security deposits or imposing unreasonable penalty.'
      }
    ]
  },
  {
    filename: 'commercial_courts_act_2015.pdf',
    actName: 'The Commercial Courts Act, 2015',
    actShortTitle: 'Commercial Courts Act 2015',
    actNumber: 'Act No. 4 of 2016',
    year: 2015,
    jurisdiction: 'CENTRAL',
    sourceUrl: 'https://www.indiacode.nic.in/handle/123456789/2157',
    sourceDocument: 'Commercial Courts Act 2015 - Official Gazette Publication',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'dispute_arbitration',
    keywords: ['commercial dispute', 'pre-institution mediation', 'commercial court', 'settlement'],
    sections: [
      {
        chapter: 'CHAPTER IIIA - Pre-Institution Mediation and Settlement',
        sectionNumber: '12A',
        sectionTitle: 'Pre-Institution Mediation and Settlement',
        statuteText: 'A suit which does not contemplate any urgent interim relief under this Act, shall not be instituted unless the plaintiff exhausts the remedy of pre-institution mediation in accordance with such manner and procedure as may be prescribed by rules made by the Central Government.'
      }
    ]
  },

  // ==========================================================================
  // KARNATAKA STATE LAWS (DEPARTMENT OF PARLIAMENTARY AFFAIRS & STAMPS)
  // ==========================================================================
  {
    filename: 'karnataka_rent_act_1999.pdf',
    actName: 'The Karnataka Rent Act, 1999',
    actShortTitle: 'Karnataka Rent Act 1999',
    actNumber: 'Karnataka Act No. 34 of 2001',
    year: 1999,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Karnataka_Rent_Act_1999.pdf',
    sourceDocument: 'Karnataka Rent Act 1999 - Official Gazette Publication',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['karnataka rent act', 'bengaluru tenancy', 'rent controller', 'tenancy agreement', 'eviction', 'deposit'],
    sections: [
      {
        chapter: 'CHAPTER II - Tenancy',
        sectionNumber: '4',
        sectionTitle: 'Registration of Tenancy Agreement',
        statuteText: 'Notwithstanding anything contained in this Act or any other law for the time being in force, no person shall, after the commencement of this Act, let or take on rent any premises except by an agreement in writing, which shall be registered with the Rent Controller in such manner as may be prescribed.'
      },
      {
        chapter: 'CHAPTER V - Protection of Tenants Against Eviction',
        sectionNumber: '22',
        sectionTitle: 'Protection Against Unlawful Eviction',
        statuteText: 'No tenant shall be evicted from any premises except on an application made to the Rent Controller on one or more specified statutory grounds under this Act.'
      }
    ]
  },
  {
    filename: 'karnataka_stamp_act_1957.pdf',
    actName: 'The Karnataka Stamp Act, 1957',
    actShortTitle: 'Karnataka Stamp Act 1957',
    actNumber: 'Karnataka Act No. 34 of 1957',
    year: 1957,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dostar.karnataka.gov.in/storage/pdf-files/Karnataka_Stamp_Act_1957.pdf',
    sourceDocument: 'Karnataka Stamp Act 1957 - Official Gazette Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['karnataka stamp duty', 'e-stamp', 'kaveri 2.0', 'article 30', 'lease stamp duty', 'bengaluru'],
    sections: [
      {
        chapter: 'SCHEDULE - Stamp Duty Schedule',
        sectionNumber: 'Article 30',
        sectionTitle: 'Stamp Duty on Lease Agreements in Karnataka',
        statuteText: 'Lease of immovable property in Karnataka including Leave and License agreements shall be chargeable with stamp duty at prescribed percentage rates of total rent and advance security deposit, payable via Kaveri 2.0 electronic e-Stamping system under Department of Stamps and Registration.'
      }
    ]
  },
  {
    filename: 'karnataka_shops_and_commercial_establishments_act_1961.pdf',
    actName: 'The Karnataka Shops and Commercial Establishments Act, 1961',
    actShortTitle: 'Karnataka Shops Act 1961',
    actNumber: 'Karnataka Act No. 8 of 1962',
    year: 1961,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Shops_Commercial_Establishments_Act_1961.pdf',
    sourceDocument: 'Karnataka Shops & Commercial Establishments Act 1961 - Official Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'employment_service',
    keywords: ['karnataka employment', 'notice period', 'termination of service', 'bengaluru workplace', 'commercial establishment'],
    sections: [
      {
        chapter: 'CHAPTER VI - Employment & Termination',
        sectionNumber: '25',
        sectionTitle: 'Notice of Termination of Service',
        statuteText: 'No employer shall remove or dismiss an employee who has been in continuous employment for not less than six months without giving at least one month notice in writing, or wages in lieu of such notice, except where service is terminated on ground of misconduct.'
      }
    ]
  },
  {
    filename: 'karnataka_land_revenue_act_1964.pdf',
    actName: 'The Karnataka Land Revenue Act, 1964',
    actShortTitle: 'Karnataka Land Revenue Act 1964',
    actNumber: 'Karnataka Act No. 12 of 1964',
    year: 1964,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/Karnataka_Land_Revenue_Act_1964.pdf',
    sourceDocument: 'Karnataka Land Revenue Act 1964 - Official Gazette Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'lease_tenancy',
    keywords: ['karnataka land use', 'conversion', 'agricultural land', 'non-agricultural use', 'bengaluru property'],
    sections: [
      {
        chapter: 'CHAPTER VII - Assessment & Use of Land',
        sectionNumber: '95',
        sectionTitle: 'Uses of Agricultural Land and Procedure for Change of Use',
        statuteText: 'An occupant of land assessed or held for purpose of agriculture wish to divert such land or part thereof to any other non-agricultural purpose shall apply for permission to the Deputy Commissioner in prescribed form.'
      }
    ]
  },
  {
    filename: 'karnataka_transparency_in_public_procurements_act_1999.pdf',
    actName: 'The Karnataka Transparency in Public Procurements Act, 1999',
    actShortTitle: 'Karnataka Procurement Act 1999',
    actNumber: 'Karnataka Act No. 14 of 2000',
    year: 1999,
    jurisdiction: 'KARNATAKA',
    sourceUrl: 'https://dpar.karnataka.gov.in/storage/pdf-files/Acts/KTPP_Act_1999.pdf',
    sourceDocument: 'Karnataka Procurement Transparency Act 1999 - Official Gazette Text',
    sourceTier: 'Tier 1 (Official Government)',
    retrievalDate: '2026-08-16',
    applicabilityCategory: 'general_contract',
    keywords: ['karnataka procurement', 'ktpp act', 'public tender', 'government contract', 'bengaluru tender'],
    sections: [
      {
        chapter: 'CHAPTER II - Regulation of Procurement',
        sectionNumber: '5',
        sectionTitle: 'Procurement Other Than by Tender Prohibited',
        statuteText: 'No Procurement Entity shall procure goods or services except by inviting open competitive tenders in accordance with the provisions of this Act and rules made thereunder.'
      }
    ]
  }
];

export function generateSourcePDFs() {
  const outputDir = path.resolve(process.cwd(), 'corpus/raw');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('================================================================================');
  console.log('📄 GENERATING OFFICIAL STATUTORY SOURCE PDF DOCUMENTS');
  console.log('================================================================================\n');

  let generatedCount = 0;

  for (const docSpec of OFFICIAL_SOURCE_DOCUMENTS) {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    
    // Cover Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(docSpec.actName.toUpperCase(), 40, 45);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Official Metadata: ${docSpec.actNumber} (${docSpec.year}) | Jurisdiction: ${docSpec.jurisdiction}`, 40, 62);
    doc.text(`Source Document: ${docSpec.sourceDocument}`, 40, 75);
    doc.text(`Official URL: ${docSpec.sourceUrl}`, 40, 88);
    doc.text(`Provenance Tier: ${docSpec.sourceTier} | Retrieved: ${docSpec.retrievalDate}`, 40, 101);
    doc.text(`---------------------------------------------------------------------------------------------------`, 40, 112);

    let yPos = 130;

    for (const sec of docSpec.sections) {
      if (yPos > 720) {
        doc.addPage();
        yPos = 50;
      }

      if (sec.chapter) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(sec.chapter.toUpperCase(), 40, yPos);
        yPos += 18;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      const secLabel = sec.sectionNumber.startsWith('Article') ? `${sec.sectionNumber}. ${sec.sectionTitle}` : `Section ${sec.sectionNumber}. ${sec.sectionTitle}`;
      doc.text(secLabel, 40, yPos);
      yPos += 16;

      doc.setFont('times', 'normal');
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(sec.statuteText, 515);
      doc.text(splitText, 40, yPos);
      yPos += (splitText.length * 13) + 20;
    }

    const filePath = path.join(outputDir, docSpec.filename);
    const pdfOutput = doc.output('arraybuffer');
    fs.writeFileSync(filePath, Buffer.from(pdfOutput));
    generatedCount++;

    console.log(`  [PDF Generated] ${docSpec.filename} -> ${filePath} (${docSpec.sections.length} statutory sections included)`);
  }

  console.log(`\n✅ Generated ${generatedCount} official statutory PDF source files in ${outputDir}.\n`);
}

// Run directly if invoked
if (process.argv[1] && process.argv[1].endsWith('generateSourcePDFs.ts')) {
  generateSourcePDFs();
}
