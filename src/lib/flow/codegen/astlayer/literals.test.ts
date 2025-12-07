import { LiteralEnum } from "./finalrepr";
import { writeLiteral } from "./literals";

console.log('=> Testing literal');

describe('literals', () => {
	test('basic literal formatting', () => {
		// table array
		let written = writeLiteral({
			type: LiteralEnum.TableArray,
			inline: true,
			value: [
				{
					type: LiteralEnum.String,
					value: 'abc',
					interpolated: false
				},
				{
					type: LiteralEnum.String,
					value: 'def',
					interpolated: false
				}
			]
		});
		console.log(written);
		expect(written).toBe('{"abc", "def"}');

		written = writeLiteral({
			type: LiteralEnum.Table,
			inline: true,
			value: [
				{
					key: {
						type: LiteralEnum.String,
						value: 'abc',
						interpolated: false
					},
					value: {
						type: LiteralEnum.String,
						value: 'foo',
						interpolated: false
					}
				},
				{
					key: {
						type: LiteralEnum.String,
						value: 'bar baz',
						interpolated: false
					},
					value: {
						type: LiteralEnum.TableArray,
						value: [
							{
								type: LiteralEnum.String,
								value: 'foo foo\nfoo',
								interpolated: false
							},
							{
								type: LiteralEnum.Boolean,
								value: false
							},
							{
								type: LiteralEnum.Nil
							},
							{
								type: LiteralEnum.Raw,
								value: '_G'
							}
						],
						inline: false
					}
				},
				{
					key: {
						type: LiteralEnum.String,
						value: 'def',
						interpolated: false
					},
					value: {
						type: LiteralEnum.Number,
						value: 184
					}
				},
				{
					key: {
						type: LiteralEnum.String,
						value: 'ghi',
						interpolated: false
					},
					value: {
						type: LiteralEnum.Table,
						value: [
							{
								key: {
									type: LiteralEnum.String,
									value: 'my nested table',
									interpolated: false
								},
								value: {
									type: LiteralEnum.Parens,
									inner: {
										type: LiteralEnum.Vector,
										x: 256,
										y: 137,
										z: 1.2
									}
								}
							}
						],
						inline: false
					}
				}
			]
		});
		console.log(written);
		expect(written).toBe(
			'{abc = "foo", ["bar baz"] = {"foo foo\\nfoo", false, nil, _G}, def = 184, ghi = {["my nested table"] = (vector.create(256, 137, 1.2))}}'
		);
	});
});
