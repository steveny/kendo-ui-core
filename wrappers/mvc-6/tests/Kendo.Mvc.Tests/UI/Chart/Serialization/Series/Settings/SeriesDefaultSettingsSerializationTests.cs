﻿using System;
using Xunit;
using Kendo.Mvc.UI;
using Kendo.Mvc.UI.Fluent;
using Kendo.Mvc.Tests;
using System.Collections.Generic;

namespace Kendo.Mvc.UI.Tests
{
    public class SeriesDefaultSettingsSerializationTests
    {
        private readonly ChartSeriesDefaultsSettings<object> settings;

        public SeriesDefaultSettingsSerializationTests()
        {
            settings = new ChartSeriesDefaultsSettings<object>();
        }

        [Fact]
        public void Default_Area_series_should_not_be_serialized()
        {
            settings.Serialize().ContainsKey("area").ShouldBeFalse();
        }

        [Fact]
        public void Area_series_should_be_serialized()
        {
            settings.Area.Data = new int[] { 1, 2, 3 };

            settings.Serialize().ContainsKey("area").ShouldBeTrue();
        }

        [Fact]
        public void Default_Candlestick_series_should_not_be_serialized()
        {
            settings.Serialize().ContainsKey("candlestick").ShouldBeFalse();
        }

        [Fact]
        public void Candlestick_series_should_be_serialized()
        {
            settings.Candlestick.Data = new int[] { 1, 2, 3 };

            settings.Serialize().ContainsKey("candlestick").ShouldBeTrue();
        }

        [Fact]
        public void Default_Column_series_should_not_be_serialized()
        {
            settings.Serialize().ContainsKey("column").ShouldBeFalse();
        }

        [Fact]
        public void Column_series_should_be_serialized()
        {
            settings.Column.Data = new int[] { 1, 2, 3 };

            settings.Serialize().ContainsKey("column").ShouldBeTrue();
        }
    }
}