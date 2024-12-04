'use client';

import { useEffect, useState } from 'react';

interface Command {
	name: string;
	description: string;
	args: string[];
}

interface Category {
	category: string;
	items: Command[];
}

const CommandsComponent = () => {
	const [categories, setCategories] = useState<Category[]>([]);
	const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [selectedCategory, setSelectedCategory] = useState<string>('All');
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchCommands = async () => {
			try {
				const response = await fetch('/api/commands'); // Replace the API endpoint
				const data: Category[] = await response.json();
				setCategories(data);
				setFilteredCommands(data.flatMap((category) => category.items));
				setLoading(false);
			} catch (error) {
				console.error('Error fetching commands:', error);
				setLoading(false);
			}
		};

		fetchCommands();
	}, []);

	useEffect(() => {
		const allCommands = categories.flatMap((category) =>
			selectedCategory === 'All' || selectedCategory === category.category ? category.items : []
		);

		const filtered = allCommands.filter(
			(command) =>
				command.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				command.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
				command.args.some((arg) => arg.toLowerCase().includes(searchTerm.toLowerCase()))
		);

		setFilteredCommands(filtered);
	}, [searchTerm, selectedCategory, categories]);

	if (loading) {
		return (
			<div className="flex justify-center items-center h-screen bg-white bg-opacity-5 rounded border border-white border-opacity-5">
				<div className="animate-pulse text-2xl text-white text-opacity-50">Loading commands...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8 max-w-6xl bg-white bg-opacity-5 rounded border border-white border-opacity-5 min-h-screen text-gray-100">
			<h1 className="text-4xl font-bold text-center text-gray-100 mb-10 tracking-tight">
				Command Reference
			</h1>

			{/* Filters Container */}
			<div className="flex flex-col md:flex-row gap-4 mb-8">
				<div className="flex-grow">
					<input
						type="text"
						placeholder="Search commands by name, description, or arguments..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full px-4 py-2 bg-background bg-opacity-10 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 shadow-sm"
					/>
				</div>
				<div>
					<select
						value={selectedCategory}
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="w-full md:w-auto px-4 py-2 bg-background bg-opacity-10 text-gray-100 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300 shadow-sm"
					>
						<option
							value="All"
							className="bg-white bg-opacity-5 rounded border border-white border-opacity-5"
						>
							All Categories
						</option>
						{categories.map((category) => (
							<option
								key={category.category}
								value={category.category}
								className="bg-white bg-opacity-5 rounded border border-white border-opacity-5"
							>
								{category.category}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Commands Table */}
			{filteredCommands.length === 0 ? (
				<div className="text-center text-gray-500 text-xl py-8">
					No commands found matching your search
				</div>
			) : (
				<div className="overflow-x-auto">
					<table className="w-full bg-background bg-opacity-10 shadow-lg rounded-lg overflow-hidden">
						<thead className="bg-purple-900 bg-opacity-30 border-b border-gray-600">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
									Name
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
									Description
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
									Category
								</th>
								<th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
									Arguments
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-700">
							{filteredCommands.map((command) => (
								<tr
									key={command.name}
									className="hover:bg-purple-950 hover:bg-opacity-10 transition-colors duration-200"
								>
									<td
										className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100 
										before:content-['Name:'] before:font-bold before:mr-2 before:md:hidden 
										md:before:content-none"
									>
										{command.name}
									</td>
									<td
										className="px-4 py-3 text-sm text-gray-300 
										before:content-['Description:'] before:font-bold before:mr-2 before:md:hidden 
										md:before:content-none"
									>
										{command.description}
									</td>
									<td
										className="px-4 py-3 text-sm text-gray-300 
										before:content-['Category:'] before:font-bold before:mr-2 before:md:hidden 
										md:before:content-none"
									>
										{
											categories.find((category) =>
												category.items.some((item) => item.name === command.name)
											)?.category
										}
									</td>

									<td
										className="px-4 py-3 text-sm text-gray-300 
										before:content-['Arguments:'] before:font-bold before:mr-2 before:md:hidden 
										md:before:content-none"
									>
										{command.args.length > 0 ? command.args.join(', ') : 'None'}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default CommandsComponent;
