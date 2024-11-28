export default function designGuide() {
	return (
		<>
			<section className="flex flex-col gap-10 max-w-[80%] mx-auto max-[360px]:max-w-[90%]">
				<div className="text-center md:text-left">
					<h1 className="text-4xl font-monster font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
						<span className="block text-foreground xl:inline">[Project] Style Guide</span>
					</h1>
					<p className="mt-3 text-base text-center md:text-left text-foreground font-semibold font-cabin ml-3 sm:mt-5 sm:text-lg md:ml-0 md:mt-5 md:text-xl lg:ml-0 lg:mx-0">
						Information about project{' '}
						<span className="text-purple-600 font-bold">Styling and Designing</span>.
					</p>
				</div>

				<div className="w-full h-[1px] bg-white opacity-15"></div>

				<div className="flex flex-col gap-10">
					<div className="flex justify-between flex-wrap  gap-10">
						<div className="flex flex-1 flex-col gap-10">
							{/* color palette */}
							<div className="flex flex-col gap-3">
								<h2 className="text-2xl font-inter font-semibold">Color Palette</h2>
								<div className="flex flex-col gap-3 ml-[1rem]">
									<div className="flex items-center gap-3">
										<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-primary"></div>
										<p className="font-inter font-normal">Brand #8100BD</p>
									</div>
									<div className="flex items-center gap-3">
										<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-secondary "></div>
										<p className="font-inter font-normal">Secondary #262428</p>
									</div>
									<div className="flex items-center gap-3">
										<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-background"></div>
										<p className="font-inter font-normal">Base #0A0118</p>
									</div>
									<div className="flex items-center gap-3">
										<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-foreground"></div>
										<p className="font-inter font-normal">Text #FAFAFA</p>
									</div>
									<div className="flex items-center gap-3">
										<div className="rounded-full w-[50px]  border border-white border-opacity-10 h-[50px] bg-extra"></div>
										<p className="font-inter font-normal">Extra #5046EF</p>
									</div>
								</div>
							</div>

							{/* fonts */}
							<div className="flex flex-col gap-3">
								<h2 className="text-2xl font-inter font-semibold">Fonts</h2>
								<div className="flex flex-col gap-3  ml-[1rem]">
									<p className="flex flex-col font-inter font-normal">
										1. Inter
										<span className="ml-7">
											Bold - <br />{' '}
											<span className="ml-4 font-bold">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
										<span className="ml-7">
											Medium - <br />{' '}
											<span className="ml-4 font-medium">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
										<span className="ml-7">
											Thin - <br />{' '}
											<span className="ml-4 font-thin">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
									</p>
									<p className="flex flex-col font-monster font-normal">
										2. Monster
										<span className="ml-7">
											Bold - <br />{' '}
											<span className="ml-4 font-bold">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
										<span className="ml-7">
											Medium - <br />{' '}
											<span className="ml-4 font-medium">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
										<span className="ml-7">
											Thin - <br />{' '}
											<span className="ml-4 font-thin">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
									</p>
									<p className="flex flex-col font-cabin font-normal">
										3. Cabin
										<span className="ml-7">
											Bold - <br />{' '}
											<span className="ml-4 font-bold">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
										<span className="ml-7">
											Medium - <br />{' '}
											<span className="ml-4 font-medium">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
										<span className="ml-7">
											Thin - <br />{' '}
											<span className="ml-4 font-thin">
												The quick brown fox jumps over the lazy dog.!?#@:;
											</span>
										</span>
									</p>
								</div>
							</div>
						</div>

						<div className="flex flex-1 flex-col gap-10">
							{/* Typography */}
							<div className="flex flex-col gap-3">
								<h2 className="text-2xl font-inter font-semibold">Typography</h2>
								<div className="flex flex-col gap-3 ml-[1rem]">
									<p className="font-normal font-monster text-[50px]">
										<span className="font-bold ">Heading 1</span> - 50px
									</p>
									<p className="font-normal font-monster text-[38px]">
										<span className="font-bold">Heading 2</span> - 38px
									</p>
									<p className="font-normal font-monster text-[32px]">
										<span className="font-bold">Heading 3</span> - 32px
									</p>
									<p className="font-normal font-monster text-[28px]">
										<span className="font-bold">Heading 4</span> - 28px
									</p>
									<p className="font-normal font-monster text-[22px]">
										<span className="font-bold">Heading 5</span> - 22px
									</p>
									<p className="font-normal font-monster text-[20px]">
										<span className="font-bold">Heading 6</span> - 20px
									</p>
									<p className="font-normal text-justify font-monster text-[14px]">
										<span className="text-justify">
											Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quam eveniet
											repellendus et nesciunt esse sed autem, itaque deleniti dicta doloribus quasi
											nihil molestias necessitatibus quisquam illum perferendis! Cumque, dicta
											officia illum incidunt cum qui aliquam deserunt sint molestiae eaque, dolorem
											nam soluta, suscipit dolorum veniam laborum eos repellat consequuntur. Quidem
											laborum quos asperiores et voluptas neque suscipit qui ab corrupti.
										</span>{' '}
										- 14px
									</p>
								</div>
							</div>

							{/* Unordered List */}
							<div className="flex flex-col gap-3">
								<h2 className="text-2xl font-monster font-semibold">Unordered List</h2>
								<p className="text-sm font-normal">Font: Monster, Regular, 14px, color: Text</p>
								<div className="flex flex-col gap-3  ml-[1rem]">
									<ul className="list-disc font-monster font-normal  ml-5">
										<li>Unordered List Item</li>
										<li>Unordered List Item</li>
										<li>Unordered List Item</li>
									</ul>
								</div>
							</div>

							{/* Ordered List */}
							<div className="flex flex-col gap-3">
								<h2 className="text-2xl font-monster font-semibold">Ordered List</h2>
								<p className="text-sm font-normal">Font: Monster, Regular, 14px, color: Text</p>
								<div className="flex flex-col gap-3  ml-[1rem]">
									<ol className="list-decimal font-monster  font-normal ml-5">
										<li>Ordered List Item</li>
										<li>Ordered List Item</li>
										<li>Ordered List Item</li>
									</ol>
								</div>
							</div>
						</div>
					</div>
					<div className="w-full h-[1px] bg-white opacity-15"></div>

					{/* buttons */}
					<div className="flex flex-col gap-5">
						<h2 className="text-2xl font-monster font-semibold">Buttons</h2>
						<div className="flex flex-row flex-wrap justify-between gap-5">
							<div className="flex flex-col gap-3">
								<p className="text-sm font-normal">Font: Monster, Semibold, 18px, color: Text</p>
								<div className="flex flex-col gap-3">
									<div>
										<button className="bg-extra px-4 py-2 rounded-sm text-foreground font-semibold text-[18px] border border-white border-opacity-5 hover:brightness-[80%] transition-all">
											Primary Button
										</button>
									</div>
								</div>
							</div>

							<div className="flex flex-col gap-3">
								<p className="text-sm font-normal">Font: Monster, Semibold, 18px, color: Text</p>
								<div className="flex flex-col gap-3">
									<div>
										<button className="bg-secondary px-4 py-2 rounded-sm text-foreground font-semibold text-[18px] border border-white border-opacity-5 hover:brightness-[80%] transition-all">
											Secondary Button
										</button>
									</div>
								</div>
							</div>

							{/* ghost */}

							<div className="flex flex-col gap-3">
								<p className="text-sm font-normal">Font: Monster, Semibold, 18px, color: Text</p>
								<div>
									<button className="bg-transparent px-4 py-2 rounded-sm text-foreground font-semibold text-[18px] hover:brightness-[80%] hover:bg-secondary hover:border hover:border-white hover:border-opacity-5 transition-all">
										Ghost Button
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
