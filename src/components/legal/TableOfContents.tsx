import React from 'react';

interface Section {
	id: string;
	title: string;
	icon: React.ReactNode;
}

interface TableOfContentsProps {
	sections: Section[];
	activeSection: string;
	scrollToSection: (id: string) => void;
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
	sections,
	activeSection,
	scrollToSection
}) => {
	return (
		<div className="mb-8 p-4 bg-accent rounded-lg">
			<h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
				{sections.map((section) => (
					<button
						key={section.id}
						onClick={() => scrollToSection(section.id)}
						className={`flex items-center p-2 rounded-md text-left transition-colors ${
							activeSection === section.id
								? 'bg-primary text-primary-foreground'
								: 'hover:bg-accent-foreground/10'
						}`}
					>
						<span className="mr-2">{section.icon}</span>
						{section.title}
					</button>
				))}
			</div>
		</div>
	);
};

export default TableOfContents;
