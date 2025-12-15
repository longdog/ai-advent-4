import { tool } from "langchain"
import { z } from "zod"

export const fridgeTool = tool(
  async () => ["молоко", "яйца", "масло", "сыр", "бананы", "томаты", "огурцы"],
  {
    schema: z.object({}),
    responseFormat: "content_and_artifact",
    name: "my_fridge",
    description:
      //  "Access to the contents of the refrigerator for cooking meals. Returns a list of available products.",
      "Доступ к содержимому холодильника для приготовления блюд. Возвращает список продуктов, доступных для использования.",
  },
)

/*
{
        "type": "function",
        "name": "get_horoscope",
        "description": "Get today's horoscope for an astrological sign.",
        "parameters": {
            "type": "object",
            "properties": {
                "sign": {
                    "type": "string",
                    "description": "An astrological sign like Taurus or Aquarius",
                },
            },
            "required": ["sign"],
        },
    },
*/
